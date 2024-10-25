# @gusto/embedded-react-sdk

To install dependencies:

```bash
npm install
```

To run:

```bash
npm run dev
```

## Local development

- Follow setup instructions in the readme for [GWS Flows](https://github.com/Gusto/gws-flows)
- In this project folder, run `yarn link`
- In GWS-Flows project folder, run `yarn link "@gusto/embedded-react-sdk"`

Now your local changes appear in GWS Flows.

To see the SDK running in GWS Flows, visit it [locally](http://localhost:7777/demos?react_sdk=true) and choose `React SDK` under `Select a Type` and click `Create Demo`

## Cutting a new release

- Get your changes and a version increase in the package.json `version` field into the main branch however you want
- Run the `Publish to NPM` GitHub action [here](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml) by clicking `Run workflow`
