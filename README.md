# webforms-mithril

Som Energia Webforms frontend (mithril based reimplementation)

If you are new to Javascript, NodeJS, Webpack, Mithril or MDC4W,
most of what you need to develop is explained in the
[internal course documentation](http://github.com/som-energia/courses)

```bash
$ sudo apt install npm # on Debian or Ubuntu GNU/Linux
# From the project root
$ npm install # installs javascript dependencies
$ npm run server # To run the development server
$ npm run build # To generate a development build into dist/
$ npm run deploy # To generate a production build into dist/
$ ./deployopendata.sh # From the office network deploys Open Data into the server
```

## Component Examples

The generated `index.html` page instatiates all the examples of the components
in the repository.

Most components are [documented](jsdoc/) with JSDoc.

## Contract

Available as `contract.html`.
It is the electritity contract form.

See the [documentation](docs/contract)

## Open Data API front-end

It is a form to call the Som Energia Open Data API.
Available at `opendata.html`.

This form is going to be eventually moved into its own repository as soon
as we have a stable set of widgets to build them as a library.

## Minor problems

### Error loading images:

If when you start the development server and the following error ocurrs:

`Module not found: Error: Can't resolve '../images/ic_keyboard_arrow_left_black_24px.svg' in '/home/juan-pe/projects/webforms_project/webforms-mithril/node_modules/md-date-time-picker/dist/css/themes/light/light-green'`

It's because the time-picker cannot find the images folder. To solve it:

```bash
$ cd node_modules/md-date-time-picker/dist/css/themes/light
$ ln -s ../../../../../md-date-time-picker/src/images .
```
