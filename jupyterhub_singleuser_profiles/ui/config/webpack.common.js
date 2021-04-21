const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { setupWebpackDotenvFilesForEnv } = require('./dotenv');

const RELATIVE_DIRNAME = process.env._JSP_RELATIVE_DIRNAME;
const IMAGES_DIRNAME = process.env._JSP_IMAGES_DIRNAME;
const PUBLIC_PATH = process.env._JSP_PUBLIC_PATH;
const SRC_DIR = process.env._JSP_SRC_DIR;
const DIST_DIR = process.env._JSP_DIST_DIR;
const OUTPUT_ONLY = process.env._JSP_OUTPUT_ONLY;

if (OUTPUT_ONLY !== true) {
  console.info(
    `\nPrepping files...\n  SRC DIR: ${SRC_DIR}\n  OUTPUT DIR: ${DIST_DIR}\n  PUBLIC PATH: ${PUBLIC_PATH}\n`
  );
}

module.exports = env => {
  return {
    entry: {
      app: path.join(SRC_DIR, 'index.tsx')
    },
    module: {
      rules: [
        {
          test: /\.(tsx|ts|jsx|js)?$/,
          include: [SRC_DIR],
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true
              }
            }
          ]
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          // only process modules with this loader
          // if they live under a 'fonts' or 'pficon' directory
          include: [
            path.resolve(RELATIVE_DIRNAME, 'node_modules/patternfly/dist/fonts'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-core/dist/styles/assets/fonts'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-core/dist/styles/assets/pficon'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/patternfly/assets/fonts'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/patternfly/assets/pficon')
          ],
          use: {
            loader: 'file-loader',
            options: {
              // Limit at 50k. larger files emitted into separate files
              limit: 5000,
              outputPath: 'fonts',
              name: '[name].[ext]'
            }
          }
        },
        {
          test: /\.svg$/,
          include: input => input.indexOf('background-filter.svg') > 1,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'svgs',
                name: '[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader if they live under a 'bgimages' directory
          // this is primarily useful when applying a CSS background using an SVG
          include: input => input.indexOf(IMAGES_DIRNAME) > -1,
          use: {
            loader: 'svg-url-loader',
            options: {
              limit: 10000
            }
          }
        },
        {
          test: /\.svg$/,
          // only process SVG modules with this loader when they don't live under a 'bgimages',
          // 'fonts', or 'pficon' directory, those are handled with other loaders
          include: input =>
            input.indexOf(IMAGES_DIRNAME) === -1 &&
            input.indexOf('fonts') === -1 &&
            input.indexOf('background-filter') === -1 &&
            input.indexOf('pficon') === -1,
          use: {
            loader: 'raw-loader',
            options: {}
          }
        },
        {
          test: /\.(jpg|jpeg|png|gif)$/i,
          include: [
            SRC_DIR,
            path.resolve(RELATIVE_DIRNAME, 'node_modules/patternfly'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/patternfly/assets/images'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-styles/css/assets/images'),
            path.resolve(RELATIVE_DIRNAME, 'node_modules/@patternfly/react-core/dist/styles/assets/images'),
            path.resolve(
              RELATIVE_DIRNAME,
              'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'
            ),
            path.resolve(
              RELATIVE_DIRNAME,
              'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'
            ),
            path.resolve(
              RELATIVE_DIRNAME,
              'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images'
            )
          ],
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                outputPath: 'images',
                name: '[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader'
          ]
        },
        {
          test: /\.ya?ml$/,
          use: 'js-yaml-loader'
        }
      ]
    },
    output: {
      filename: '[name].bundle.js',
      path: DIST_DIR,
      publicPath: PUBLIC_PATH
    },
    plugins: [
      ...setupWebpackDotenvFilesForEnv({ directory: RELATIVE_DIRNAME }),
      new HtmlWebpackPlugin({
        template: path.join(SRC_DIR, 'index.html')
      }),
      new CopyPlugin({
        patterns: [
          { from: path.join(SRC_DIR, 'locales'), to: path.join(DIST_DIR, 'locales'), noErrorOnMissing: true },
          { from: path.join(SRC_DIR, 'favicons'), to: path.join(DIST_DIR, 'favicons'), noErrorOnMissing: true },
          { from: path.join(SRC_DIR, 'images'), to: path.join(DIST_DIR, 'images'), noErrorOnMissing: true },
          { from: path.join(SRC_DIR, 'favicon.ico'), to: path.join(DIST_DIR), noErrorOnMissing: true },
          { from: path.join(SRC_DIR, 'favicon.png'), to: path.join(DIST_DIR), noErrorOnMissing: true },
          { from: path.join(SRC_DIR, 'manifest.json'), to: path.join(DIST_DIR), noErrorOnMissing: true },
          { from: path.join(SRC_DIR, 'robots.txt'), to: path.join(DIST_DIR), noErrorOnMissing: true }
        ]
      })
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(RELATIVE_DIRNAME, './tsconfig.json')
        })
      ],
      symlinks: false,
      cacheWithContext: false
    }
  };
};
