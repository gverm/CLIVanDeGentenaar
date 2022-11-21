# CLIVanDeGentenaar

Browse the data-portal, hacker style 😎

## How to install

Create a venv, install the dependencies

```
python3 -m venv /tmp/clivandegentenaar
source /tmp/clivandegentenaar/bin/activate
pip install -r requirements.txt
```

## How to run
This application depends on [ascii-image-converter](https://github.com/TheZoraiz/ascii-image-converter), make sure it's available in your PATH.


Run the application:

```
python app.py
```

Run cli

```
npm i
npx tsc
chmod -R 777 ./build
./build/cli.js search <query>
```
