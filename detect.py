from tensorflow.keras.applications.resnet50 import ResNet50
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input, decode_predictions
import numpy as np

model = ResNet50(weights="imagenet")


class Detector:
    def detect(self, image_path):
        preds = model.predict(self._load_image(image_path))
        # decode the results into a list of tuples (class, description, probability)
        # (one such list for each sample in the batch)
        # print('Predicted:', decode_predictions(preds, top=3)[0])
        decoded_predictions = decode_predictions(preds, top=5)[0]
        parsed_decoded_predictions = list()
        for decoded_prediction in decoded_predictions:
            parsed_decoded_predictions.append(decoded_prediction[1])
        return parsed_decoded_predictions

    def _load_image(self, image_path):
        img = image.load_img(image_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        return x
