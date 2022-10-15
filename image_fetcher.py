import requests

from flask_restful import Api, Resource, abort


class ImageFetcher:
    def download_image(self, url):
        req = requests.get(url)
        if req.status_code != 200:
            abort(400, message=f"Can't download from url {url}")
        location = "/tmp/tmpfile.jpg"
        with open(location, "wb") as file:
            file.write(req.content)
