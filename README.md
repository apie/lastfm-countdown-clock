# Last fm countdown clock
Shows a clock that counts down to the date of your next event:

<img height="350" alt="Screenshot 2025-07-13 at 15-12-34 lastfm-countdown-clock" src="https://github.com/user-attachments/assets/b7c0c4d0-cbee-44f9-932c-2ef8f1901441" />

## Running

The app is a Flask backend that renders HTML with Jinja templates; [htmx](https://htmx.org) (vendored in `backend/static`) swaps in the results. There is no Node/npm build step.

```sh
cd backend
./start.bash
```

Then open http://localhost:5000.
