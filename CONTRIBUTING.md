# @gusto/embedded-react-sdk - Internal README

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
- Run `npm run dev`
- In GWS-Flows project folder, run `yarn link -r ../embedded-react-sdk`

Now your local changes appear in GWS Flows.

To see the SDK running in GWS Flows, visit it [locally](http://localhost:7777/demos?react_sdk=true) and choose `React SDK` or `React SDK (Company Onboarded)` under `Select a Type` and click `Create Demo`

Components and Flows will be shown at the top of the page in a `nav`. Company Components will automatically appear as they are added.
Select a Flow or Component to view it

## Cutting a new release

- Get your changes and a version increase in the package.json `version` field into the main branch however you want
- Run the `Publish to NPM` GitHub action [here](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml) by clicking `Run workflow`

## FAQ

- Why NPM? Why not Yarn?

NPM is the built in package manager for NodeJS. Our posture is to not bring any additional development tools into the mix where possible to help reduce inessential complexity.

