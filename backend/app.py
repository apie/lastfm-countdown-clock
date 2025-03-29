
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/events/<username>', methods=['GET'])
def get_user_events(username):
    try:
        # Attempt to scrape Last.fm events for the given username
        url = f"https://www.last.fm/user/{username}/events"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch user events", "events": []}), 404
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find event containers
        event_containers = soup.select('.events-list-item')
        
        if not event_containers:
            # No events found
            return jsonify({"events": []})
        
        # Parse each event
        events = []
        for container in event_containers:
            try:
                event_id = container.get('data-event-id', f"event-{len(events)}")
                
                # Get event title
                title_elem = container.select_one('.events-list-item-header--title')
                title = title_elem.text.strip() if title_elem else "Unknown Event"
                
                # Get artist info
                artist_elem = container.select_one('.events-list-item-details-artist')
                artist = artist_elem.text.strip() if artist_elem else "Unknown Artist"
                
                # Get venue and location
                venue_elem = container.select_one('.events-list-item-venue')
                venue = venue_elem.text.strip() if venue_elem else "Unknown Venue"
                
                location_elem = container.select_one('.events-list-item-location')
                location = location_elem.text.strip() if location_elem else "Unknown Location"
                
                # Split location into city and country
                location_parts = location.split(", ")
                city = location_parts[0] if len(location_parts) > 0 else "Unknown City"
                country = location_parts[-1] if len(location_parts) > 1 else "Unknown Country"
                
                # Get date
                date_elem = container.select_one('.events-list-item-date')
                date_str = date_elem.text.strip() if date_elem else ""
                
                # Parse date - this is simplified; actual implementation would need to handle various formats
                try:
                    # Example: convert "Friday 21 August 2023, 19:30" to timestamp
                    date_obj = datetime.strptime(date_str, "%A %d %B %Y, %H:%M")
                    start_date = date_obj.timestamp() * 1000  # Convert to milliseconds
                except Exception:
                    # Fallback: use current time
                    start_date = datetime.now().timestamp() * 1000
                
                # Get image
                img_elem = container.select_one('.events-list-item-image img')
                image_url = img_elem.get('src') if img_elem else ""
                
                # Get event URL
                url_elem = container.select_one('a.events-list-item-header--title')
                event_url = f"https://www.last.fm{url_elem.get('href')}" if url_elem and url_elem.get('href') else ""
                
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
            except Exception as e:
                print(f"Error parsing event: {str(e)}")
                continue
        
        return jsonify({"events": events})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e), "events": []}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
