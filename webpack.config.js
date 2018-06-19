const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var config = {
	plugins:[
		// Rewrites html to insert generated css and js
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './mithriltemplate.html',
			chunks: ['common','newmember'],
			}),
		new HtmlWebpackPlugin({
			filename: 'validatedinput_demo.html',
			template: './mithriltemplate.html',
			chunks: ['common','validatedinput_demo'],
			}),
		// Analyzes generated sizes
//		new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
		// Split css included as js into a separate file again
		new MiniCssExtractPlugin({
			filename: "bundle-[name]-[contenthash].css",
			chunkFilename: "chunk-[id]-[contenthash].css",
			}),
		new CleanWebpackPlugin('dist/*'),
	],
	context: path.resolve(__dirname, 'src'),
	entry: {
		newmember: './newmember',
		validatedinput_demo: './validatedinput_demo',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle-[name]-[chunkhash].js',
		chunkFilename: 'chunk-[id]-[chunkhash].js',
	},
	module: {
		rules: [
			{ test: /\.yaml$/,   use: ["json-loader", "yaml-loader" ]},
			{ test: /\.css$/,    use: [ MiniCssExtractPlugin.loader, "css-loader"]},
			{ test: /\.scss$/,   use: [ MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]},
			{ test: /\.less$/,   use: [ MiniCssExtractPlugin.loader, "css-loader", "less-loader"]},
			{ test: /\.styl$/,   use: [ MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"]},
			{ test: /\.jade$/,   loader: "jade-loader?self" },
			{ test: /\.png$/,    loader: "url-loader?prefix=img/&limit=5000" },
			{ test: /\.jpg$/,    loader: "url-loader?prefix=img/&limit=5000" },
			{ test: /\.gif$/,    loader: "url-loader?prefix=img/&limit=5000" },
			{ test: /\.woff(2)?$/,   loader: "file-loader?prefix=font/&limit=5000" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" },
		]
	},
	optimization: {
		splitChunks: {
			//chunks: 'all',
		}
	},
};

module.exports = config;

// vim: noet ts=4 sw=4
