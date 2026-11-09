## Environment

Install Doppler and authenticate: https://docs.doppler.com/docs/cli#installation <br>
You should use your personal doppler config, e.g. `dev_<your_name>`. If you don't have one - contact Oleg or John.

## Android

### Emulator setup



Pixel 5 API 30

### Running the App locally

- First time
  - Install yarn Packages `yarn`
  - Generate assets (see below)
- Map emulator ports to your local interface ports for the API and Metro Server (see below).
- Start React Native `yarn start`
- Build and Start the App in the Android Studio. You can also use your Android device run/debug the app.

### Local API

You need to open access from the emulator's interface to your local device interface.
Assuming your local API runs on port 3001, run:

```shell
adb reverse tcp:3001 tcp:3001
```

### Metro Server

You need to open access from the emulator's interface to your local device interface.

#### Default

```shell
adb reverse tcp:8081 tcp:8081
```

#### Custom Metro port

If for some reason the port cannot be used. Use a custom port for Metro.

- Add a new line to the `package.json`, `scripts` section `"start1": "<copy start> --port=9045"`.
  - You can use any available port in your system.
  - You should run Metro using `yarn start1` afterwards.
  - **Do not commit this line to the repository!**
- Configure the emulated device to use this port for contacting Metro.
  - Hit `Ctrl+M`. If the settings do not appear, run `adb shell input keyevent 82` while emulator is running.
  - Go to Settings/Debug Server Host & port for device. Enter `localhost:9045`.
  - Exit.
- Add reverse proxy
  ```shell
  adb reverse tcp:9045 tcp:9045
  ```

## Assets

You need to regenerate assets in the next scenarios:

- Before the first app build
- After anyone adds new SVG icons to the project

Run:

```shell
yarn react-native-vector-image generate
```
