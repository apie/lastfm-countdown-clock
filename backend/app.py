
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import quote
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/events/<username>', methods=['GET'])
def get_user_events(username):
    try:
        logger.info(f"Fetching events for username: {username}")
        
        # URL encode the username properly using Python's built-in quote function
        encoded_username = quote(username)
        logger.debug(f"Encoded username: {encoded_username}")
        
        # Attempt to scrape Last.fm events for the given username
        url = f"https://www.last.fm/user/{encoded_username}/events"
        logger.debug(f"Requesting URL: {url}")
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        logger.debug("Sending HTTP request...")
        response = requests.get(url, headers=headers)
        logger.debug(f"Response status code: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch user events. Status code: {response.status_code}")
            return jsonify({"error": "Failed to fetch user events", "events": []}), 404
        
        # Parse HTML with BeautifulSoup
        logger.debug("Parsing HTML with BeautifulSoup")
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Save HTML content to file for debugging
        with open("debug_lastfm_response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
            logger.debug("Saved response HTML to debug_lastfm_response.html")
        
        # Find event containers
        logger.debug("Looking for event containers with selector: .events-list-item")
        event_containers = soup.select('.events-list-item')
        logger.debug(f"Found {len(event_containers)} event containers")
        
        # Check for alternative selectors if no events found with primary selector
        if not event_containers:
            logger.debug("No events found with primary selector, trying alternative selectors")
            
            # Try different selectors that might contain events
            alternative_selectors = [
                '.events-list > li', 
                '.events-list-item-wrap',
                '.chartlist-events > li'
            ]
            
            for selector in alternative_selectors:
                logger.debug(f"Trying alternative selector: {selector}")
                event_containers = soup.select(selector)
                if event_containers:
                    logger.debug(f"Found {len(event_containers)} events with selector: {selector}")
                    break
        
        if not event_containers:
            # Log a section of the HTML to help identify the correct selector
            logger.debug("No events found with any selector. Dumping a snippet of HTML:")
            body_content = soup.body
            if body_content:
                logger.debug(body_content.prettify()[:1000] + "...")
            
            # No events found
            logger.info("No event containers found in the parsed HTML")
            return jsonify({"events": []})
        
        # Parse each event
        events = []
        for i, container in enumerate(event_containers):
            try:
                logger.debug(f"Parsing event {i+1}/{len(event_containers)}")
                event_id = container.get('data-event-id', f"event-{len(events)}")
                logger.debug(f"Event ID: {event_id}")
                
                # Get event title
                title_elem = container.select_one('.events-list-item-header--title')
                title = title_elem.text.strip() if title_elem else "Unknown Event"
                logger.debug(f"Title: {title}")
                
                # Get artist info
                artist_elem = container.select_one('.events-list-item-details-artist')
                artist = artist_elem.text.strip() if artist_elem else "Unknown Artist"
                logger.debug(f"Artist: {artist}")
                
                # Get venue and location
                venue_elem = container.select_one('.events-list-item-venue')
                venue = venue_elem.text.strip() if venue_elem else "Unknown Venue"
                logger.debug(f"Venue: {venue}")
                
                location_elem = container.select_one('.events-list-item-location')
                location = location_elem.text.strip() if location_elem else "Unknown Location"
                logger.debug(f"Location: {location}")
                
                # Split location into city and country
                location_parts = location.split(", ")
                city = location_parts[0] if len(location_parts) > 0 else "Unknown City"
                country = location_parts[-1] if len(location_parts) > 1 else "Unknown Country"
                logger.debug(f"City: {city}, Country: {country}")
                
                # Get date
                date_elem = container.select_one('.events-list-item-date')
                date_str = date_elem.text.strip() if date_elem else ""
                logger.debug(f"Date string: {date_str}")
                
                # Parse date - this is simplified; actual implementation would need to handle various formats
                try:
                    # Example: convert "Friday 21 August 2023, 19:30" to timestamp
                    logger.debug(f"Attempting to parse date: {date_str}")
                    date_obj = datetime.strptime(date_str, "%A %d %B %Y, %H:%M")
                    start_date = date_obj.timestamp() * 1000  # Convert to milliseconds
                    logger.debug(f"Parsed date: {date_obj}, timestamp: {start_date}")
                except Exception as e:
                    logger.error(f"Failed to parse date: {str(e)}")
                    # Fallback: use current time
                    start_date = datetime.now().timestamp() * 1000
                    logger.debug(f"Using fallback date: {start_date}")
                
                # Get image
                img_elem = container.select_one('.events-list-item-image img')
                image_url = img_elem.get('src') if img_elem else ""
                logger.debug(f"Image URL: {image_url}")
                
                # Get event URL
                url_elem = container.select_one('a.events-list-item-header--title')
                event_url = f"https://www.last.fm{url_elem.get('href')}" if url_elem and url_elem.get('href') else ""
                logger.debug(f"Event URL: {event_url}")
                
                # Create standardized event object
                event = {
                    "id": event_id,
                    "title": title,
                    "artists": {
                        "headliner": artist,
                        "artist": [artist]
                    },
                    "venue": {
                        "name": venue,
                        "location": {
                            "city": city,
                            "country": country
                        }
                    },
                    "startDate": start_date,
                    "description": f"{artist} at {venue}",
                    "image": [
                        image_url,
                        image_url,
                        image_url,
                        image_url
                    ],
                    "url": event_url
                }
                
                events.append(event)
                logger.debug(f"Successfully parsed event {i+1}")
            except Exception as e:
                logger.error(f"Error parsing event {i+1}: {str(e)}")
                continue
        
        logger.info(f"Successfully parsed {len(events)} events")
        return jsonify({"events": events})
    
    except Exception as e:
        logger.error(f"Error in get_user_events: {str(e)}")
        return jsonify({"error": str(e), "events": []}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(debug=True, port=5000)
