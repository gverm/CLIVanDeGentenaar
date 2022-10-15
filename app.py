import logging
import requests
import subprocess

from detect import Detector
from flask import Flask, request
from flask_restful import Api, Resource, abort
from image_fetcher import ImageFetcher

app = Flask(__name__)
api = Api(app)
app.config.update(
    {
        "SECRET_KEY": "SomethingNotEntirelySecret",
        "TESTING": True,
        "DEBUG": True,
    }
)

logging.basicConfig(
    format="%(asctime)s %(process)d,%(threadName)s %(filename)s:%(lineno)d [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

detector = Detector()
fetcher = ImageFetcher()


class AsciiArt(Resource):
    def __get_request_body(self):
        if request_body := request.get_json(silent=True):
            return request_body
        abort(405, message="Malformed request body")

    def post(self):
        url = self.__get_request_body()["url"]
        req = requests.get(url)
        if req.status_code != 200:
            abort(400, message=f"Can't download from url {url}")
        location = "/tmp/tmpfile.jpg"
        with open(location, "wb") as file:
            file.write(req.content)
        ascii_string = subprocess.run(
            ["ascii-image-converter", location], stdout=subprocess.PIPE
        ).stdout.decode("utf-8")
        logger.info(ascii_string)
        return ascii_string, 201

class GetImageAnnotations(Resource):
    def __get_request_body(self):
        if request_body := request.get_json(silent=True):
            return request_body
        abort(405, message="Malformed request body")

    def post(self):
        url = self.__get_request_body()["url"]
        fetcher.download_image(url)
        return detector.detect('/tmp/tmpfile.jpg')

api.add_resource(AsciiArt, "/asciiart")
api.add_resource(GetImageAnnotations, "/annotate")

if __name__ == "__main__":
    app.run(debug=True)
