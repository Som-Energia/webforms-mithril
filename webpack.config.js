const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const JsDocPlugin = require('jsdoc-webpack-plugin');

var config = {
	context: path.resolve(__dirname, 'src'),
	entry: {
		examples: './examples',
		gapminder: './gapminder',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle-[name].js',
		chunkFilename: 'chunk-[name].js',
	},
	devServer: {
	},
	plugins:[
		new CleanWebpackPlugin(),
		// Rewrites html to insert generated css and js
		new HtmlWebpackPlugin({
			filename: 'examples.html',
			template: './mithriltemplate.html',
			chunks: ['common','examples'],
			}),
		new HtmlWebpackPlugin({
			filename: 'gapminder.html',
			template: './mithriltemplate.html',
			chunks: ['common','gapminder'],
			}),
		// Split css included as js into a separate file again
		new MiniCssExtractPlugin({
			filename: "bundle-[name].css",
			chunkFilename: "chunk-[name].css",
			}),
        new JsDocPlugin({
            conf: './.jsdoc.json'
			}),
		new webpack.IgnorePlugin({
			resourceRegExp: /^\.\/locale$/,
			contextRegExp: /moment$/,
			}),
		// Analyzes generated sizes
//		new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
	],
	module: {
		rules: [
			{ test: /\.yaml$/,   use: ["yaml-loader" ]},
			{ test: /\.tsv$/,   use: ["dsv-loader" ]},
			{ test: /\.css$/,    use: [ MiniCssExtractPlugin.loader, "css-loader"]},
			{ test: /\.scss$/,   use: [ MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]},
			{ test: /\.less$/,   use: [ MiniCssExtractPlugin.loader, "css-loader", "less-loader"]},
			{ test: /\.styl$/,   use: [ MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"]},
			{ test: /\.jade$/,   loader: "jade-loader", options: {self: true} },
			{ test: /\.png$/,    loader: "url-loader", options: { prefix: "img/",  limit: 5000}},
			{ test: /\.jpg$/,    loader: "url-loader", options: { prefix: "img/",  limit: 5000}},
			{ test: /\.gif$/,    loader: "url-loader", options: { prefix: "img/",  limit: 5000}},
			//{ test: /\.woff(2)?$/,   loader: "file-loader", options: { prefix: "font/", limit: 5000}},
			{ test: /\.woff(2)?$/, type: "asset", generator: { filename: "font/[name][ext]" }},
			{ test: /\.eot$/,    loader: "file-loader", options: { prefix: "font/" }},
			{ test: /\.ttf$/,    loader: "file-loader", options: { prefix: "font/" }},
			{ test: /\.svg$/,    loader: "file-loader", options: { prefix: "font/" }},
			{ test: /\.html$/,   use: ["html-loader" ]},

		]
	},
	optimization: {
		splitChunks: {
			//chunks: 'all',
		}
	},
	externals: [
		'child_process',
	],
};

module.exports = (env, argv) => {

	api_urls = {
		ov_production: 'https://apiv2.somenergia.coop',
		testing: 'https://webforms-demo.somenergia.local:5001',
		development: 'https://webforms-demo.somenergia.local:5001',
		ov_test: 'https://webforms-demo.somenergia.local:5001',
	};

	var environment = !env ? argv.mode : env.NODE_ENV;
	console.log("=====================", env, argv, environment)
	config.plugins.push(new webpack.EnvironmentPlugin({
		APIBASE: api_urls[environment],
		DEV_OPENDATA_API: false, // Set this shell environment var when building to change
	}));

	return config;
};

// vim: noet ts=4 sw=4
