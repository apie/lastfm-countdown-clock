
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
from urllib.parse import quote
import logging
import uuid
from requests_html import HTMLSession
from functools import cache

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize HTML session for scraping
session = HTMLSession()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@cache
def get_artist_image(artist_name):
    """
    Scrape the artist's image from their Last.fm page.
    """
    if not artist_name or artist_name == "Unknown Artist":
        return ""
    
    try:
        encoded_artist = quote(artist_name)
        artist_url = f"https://www.last.fm/music/{encoded_artist}"
        logger.debug(f"Fetching artist image from: {artist_url}")
        
        r = session.get(artist_url)
        avatar_container = r.html.find(".header-new-background-image", first=True)
        
        if avatar_container:
            image_url = avatar_container.attrs.get("content", "")
            logger.debug(f"Found artist image: {image_url}")
            return image_url
     
                
        logger.debug(f"No artist image found for {artist_name}")
        return ""
    except Exception as e:
        logger.error(f"Error fetching artist image for {artist_name}: {str(e)}")
        return ""

@cache
def get_event_details(event_url: str):
    if event_url.startswith('/'):
        event_url = f"https://www.last.fm{event_url}"
    logger.debug(f"Fetching event details from: {event_url}")

    r = session.get(event_url)
    # Get date span element or first date strong element in case of multi date events.
    date_element = r.html.find("p.qa-event-date span", first=True) or r.html.find("p.qa-event-date strong", first=True)
    datetime_str = date_element.text
    # This attr incorrectly always contains midnight as time, so try to get the time from the datetime_str if 'at' is in it.
    datetime_attr = date_element.attrs.get('content')
    if ' at ' in datetime_str:
        _, time_str = datetime_str.split(' at ')
        datetime_obj = datetime.strptime(datetime_attr[:10]+' '+time_str, '%Y-%m-%d %I:%M%p')
    else:
        datetime_obj = datetime.fromisoformat(datetime_attr)
    # Extract event image if available
    image_url = ""
    try:
        image_elem = r.html.find(".event-expanded-image", first=True)
        if image_elem:
            image_url = image_elem.attrs.get("src", "")
    except Exception as e:
        logger.warning(f"Failed to extract image for event: {str(e)}")

    return dict(
        datetime_obj=datetime_obj,
        image_url=image_url,
    )

def get_events(username: str, year: str = ""):
    """
    Scrape events for a Last.fm user for a specific year or upcoming events.
    If year is empty, fetches upcoming events.
    """
    logger.info(f"Fetching events for {username}, year: {year if year else 'upcoming'}")
    
    # No year means upcoming events
    url = f"https://www.last.fm/user/{username}/events/{year}"
    logger.debug(f"Scraping URL: {url}")
    
    events_data = []
    try:
        r = session.get(url)
        events = r.html.find("tr.events-list-item")
        logger.debug(f"Found {len(events)} events in the HTML")
        
        for i, event in enumerate(events):
            if len(events_data) > 1:
                return events_data # return as soon as we have two events. (need more than one since we can have an event today!)
            try:
                # Extract event data
                datetimestr = event.find("time", first=True).attrs.get("datetime")
                link = "https://www.last.fm" + event.find(
                    "a.events-list-cover-link", first=True
                ).attrs.get("href")
                title = event.find(".events-list-item-event--title", first=True).text
                event_url = event.find(".events-list-item-event--title a", first=True).attrs.get("href")
                lineup = event.find(
                    ".events-list-item-event--lineup", first=True
                ).text  # Does not include main act
                location = event.find(".events-list-item-venue", first=True).text
                
                # Parse location into city and country
                location_parts = location.split(", ")
                city = location_parts[0] if len(location_parts) > 0 else "Unknown City"
                country = location_parts[-1] if len(location_parts) > 1 else "Unknown Country"
                
                # Get venue name (first part of location)
                venue = city  # Default to city if we can't parse further
                
                # Parse the datetime
                # date_obj = datetime.fromisoformat(datetimestr)

                # To get the time we have to parse the event detail page
                event_details = get_event_details(event_url)
                datetime_obj = event_details['datetime_obj']
                image_url = event_details['image_url']
                
                # Get the main artist - usually in title or can be parsed from lineup
                logger.debug('title '+title)
                logger.debug('lineup '+lineup)
                main_artist = ""
                if " - " in title:
                    main_artist = title.split(" - ")[0].strip()
                else:
                    # Just use title
                    main_artist = title
                
                # Get the artist's image from their Last.fm page
                artist_image_url = get_artist_image(main_artist)
                if not artist_image_url and lineup:
                    artist_image_url = get_artist_image(lineup.split(",")[0].strip())
                
                # Create standardized event object
                event_data = {
                    "id": str(uuid.uuid4()),
                    "title": title,
                    "artists": {
                        "headliner": main_artist,
                        "artist": [artist.strip() for artist in lineup.split(",")] if lineup else [main_artist]
                    },
                    "venue": {
                        "name": venue,
                        "location": {
                            "city": city,
                            "country": country
                        }
                    },
                    "startDate": datetime_obj.isoformat(),  # Use ISO format string
                    "description": f"{main_artist} at {venue}",
                    "image": image_url,
                    "artistImage": artist_image_url,  # New field for artist image
                    "url": link
                }
                
                events_data.append(event_data)
                logger.debug(f"Successfully parsed event {i+1}: {title}")
                
            except Exception as e:
                logger.error(f"Error parsing event {i+1}: {str(e)}")
                continue
                
        return events_data
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}")
        return []

@app.route('/api/events/<username>', methods=['GET'])
def get_user_events(username):
    try:
        logger.info(f"Fetching events for username: {username}")
        
        # URL encode the username properly
        encoded_username = quote(username)
        
        # Use the new scraping function
        events = get_events(encoded_username)
        
        if not events:
            logger.info(f"No events found for user: {username}")
            return jsonify({"events": []})
        
        logger.info(f"Successfully retrieved {len(events)} events for {username}")
        return jsonify({"events": events})
    
    except Exception as e:
        logger.error(f"Error in get_user_events: {str(e)}")
        return jsonify({"error": str(e), "events": []}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(port=5000)
