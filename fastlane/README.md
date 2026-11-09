fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios get_my_certs

```sh
[bundle exec] fastlane ios get_my_certs
```



### ios generate_certs_dev

```sh
[bundle exec] fastlane ios generate_certs_dev
```

Generate iOS development/distribution certificates and profiles for DEV environment

### ios generate_certs_stg

```sh
[bundle exec] fastlane ios generate_certs_stg
```

Generate iOS development/distribution certificates and profiles for STG environment

### ios nuke_certs_dev_stg

```sh
[bundle exec] fastlane ios nuke_certs_dev_stg
```

Revoke all iOS development/distribution certificates and profiles for STG/DEV environments

### ios generate_certs_prd

```sh
[bundle exec] fastlane ios generate_certs_prd
```

Generate iOS development/distribution certificates and profiles for PRD environment

### ios nuke_certs_prd

```sh
[bundle exec] fastlane ios nuke_certs_prd
```

Revoke iOS development/distribution certificates and profiles for PRD environment

### ios certificates

```sh
[bundle exec] fastlane ios certificates
```

Fetch iOS certificates and provisioning profiles

### ios build

```sh
[bundle exec] fastlane ios build
```

Build the dev iOS application.

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Ship iOS Dev to Testflight.

### ios upload_symbols

```sh
[bundle exec] fastlane ios upload_symbols
```

Upload symbols to Sentry

----


## Android

### android build

```sh
[bundle exec] fastlane android build
```

Build the Android application.

### android build_prod

```sh
[bundle exec] fastlane android build_prod
```

Bundle the Android application.

### android beta

```sh
[bundle exec] fastlane android beta
```

Ship to Playstore Beta.

### android upload_artifacts_to_google_drive

```sh
[bundle exec] fastlane android upload_artifacts_to_google_drive
```

Upload To Google Drive

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
