const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
// TODO replace with https://www.npmjs.com/package/striptags
// const stripHtml = require("string-strip-html");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight);

	eleventyConfig.setDynamicPermalinks(false);

	eleventyConfig.addLayoutAlias('default', 'layouts/default.liquid');
	eleventyConfig.addLayoutAlias('page', 'layouts/page.liquid');
	eleventyConfig.addLayoutAlias('post', 'layouts/post.liquid');

	eleventyConfig.addPassthroughCopy("css/fonts");
	eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy("wp-content");
	eleventyConfig.addPassthroughCopy("dist");

	eleventyConfig.addLiquidFilter("timePosted", date => {
		let numDays = ((Date.now() - date) / (1000 * 60 * 60 * 24));
		let daysPosted = Math.round( parseFloat( numDays ) );
		let yearsPosted = parseFloat( (numDays / 365).toFixed(1) );

		if( daysPosted < 365 ) {
			return daysPosted + " day" + (daysPosted !== 1 ? "s" : "");
		} else {
			return yearsPosted + " year" + (yearsPosted !== 1 ? "s" : "");
		}
	});

	eleventyConfig.addNunjucksFilter("rssNewestUpdatedDate", collection => {
		if( !collection || !collection.length ) {
			throw new Error( "Collection is empty in lastUpdatedDate filter." );
		}

		return DateTime.fromJSDate(collection[ 0 ].date).toISO({ includeOffset: true, suppressMilliseconds: true });
	});

	eleventyConfig.addLiquidFilter("readableDate", dateObj => {
		return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
	});

	eleventyConfig.addLiquidFilter("readableDateFromISO", dateStr => {
		return DateTime.fromISO(dateStr).toFormat("dd LLL yyyy 'at' hh:mma");
	});

	eleventyConfig.addLiquidFilter("longWordWrap", str => {
		let words = {
			"domcontentloaded": true,
			"getelementsbytagname": true
		};

		return str.split(" ").map(function(word) {
			return word.split("—").map(function(word) {
				return word.split("(").map(function(word) {
					return word.split(")").map(function(word) {
						return words[word.toLowerCase()] || word.length >= 12 ? `<span class="long-word">${word}</span>` : word;
					}).join(")");
				}).join("(");
			}).join("—");
		}).join(" ");
	});

	eleventyConfig.addLiquidFilter("orphanWrap", str => {
		return str.split("—").map(function(str, index, dashSplit) {
			// Uncomment this to prevent orphans only at the end of the string, not before every —
			// if( index !== dashSplit.length - 1 ) {
			// 	return str;
			// }

			let splitSpace = str.split(" ");
			let after = "";
			if( splitSpace.length > 1 ) {
				if( splitSpace.length > 2 ) {
					after += " ";
				}

				// TODO strip HTML from this?
				let lastWord = splitSpace.pop();
				let secondLastWord = splitSpace.pop();
				// skip when last two words are super long 😭
				if(`${secondLastWord} ${lastWord}`.length >= 15) {
					after += `${secondLastWord} ${lastWord}`;
				} else {
					after += `<span class="prevent-orphan">${secondLastWord} ${lastWord}</span>`;
				}
			}

			return splitSpace.join(" ") + after;
		}).join("​—​");
	});

	eleventyConfig.addLiquidFilter("wordcount", function(content) {
		let words = content.split(" ").length;
		let wordsLabel = "word" + (words !== 1 ? "s" : "");
		return `${words} ${wordsLabel}`;
	});

	eleventyConfig.addLiquidShortcode("youtubeEmbed", function(slug) {
		return `<div class="fullwidth"><div class="fluid-width-video-wrapper"><iframe class="youtube-player" type="text/html" width="640" height="385" src="https://www.youtube.com/embed/${slug}/" frameborder="0"></iframe></div></div>`;
	});

	eleventyConfig.addLiquidFilter("readingtime", function(content) {
		let wordsPerMinute = 100;
		// let words = stripHtml(content).split(" ").length;
		let words = content.split(" ").length;
		let minutes = Math.floor(words / wordsPerMinute);

		return (minutes > 0 ? `${minutes} min read` : "");
	});

	eleventyConfig.addCollection("posts", function(collection) {
		return collection.getFilteredByGlob("./_posts/*").reverse();
	});

	eleventyConfig.addCollection("feedPosts", function(collection) {
		return collection.getFilteredByGlob("./_posts/*").reverse().filter(function(item) {
			return !item.data.tags ||
				item.data.tags.indexOf("deprecated") === -1 &&
				!item.data.deprecated &&
				!item.data.feedtrim &&
				item.data.tags.indexOf("pending") === -1 &&
				item.data.tags.indexOf("draft") === -1;
		});
	});

	function hasTag(post, tag) {
		return "tags" in post.data && post.data.tags && post.data.tags.indexOf(tag) > -1;
	}

	eleventyConfig.addCollection("latestPost", function(collection) {
		let posts = collection.getSortedByDate().reverse();
		for( let item of posts ) {
			if( !!item.inputPath.match(/\/_posts\//) && !hasTag(item, "external") ) {
				return [ item ];
			}
		}
	});

	// font-loading category mapped to collection
	eleventyConfig.addCollection("font-loading", function(collection) {
		return collection.getAllSorted().filter(function(item) {
			return "categories" in item.data && item.data.categories && item.data.categories.indexOf("font-loading") > -1 ||
				"tags" in item.data && item.data.tags && item.data.tags.indexOf("font-loading") > -1;
		}).reverse();
	});

	// projects
	eleventyConfig.addCollection("projects", function(collection) {
		return collection.getFilteredByTag("project").reverse();
	});

	eleventyConfig.addCollection("researches", function(collection) {
		return collection.getFilteredByTag("research").reverse();
	});

	// presentations category mapped to collection
	eleventyConfig.addCollection("presentations", function(collection) {
		return collection.getAllSorted().filter(function(item) {
			return "categories" in item.data && item.data.categories && item.data.categories.indexOf("presentations") > -1 ||
				"tags" in item.data && item.data.tags && item.data.tags.indexOf("speaking") > -1;
		}).reverse();
	});

	eleventyConfig.addCollection("popularPostsRanked", function(collection) {
		return collection.getFilteredByTag("popular-posts").sort(function(a, b) {
			return b.data.postRank - a.data.postRank;
		}).reverse();
	});

	eleventyConfig.addCollection("popularPostsTotalRanked", function(collection) {
		return collection.getFilteredByTag("popular-posts-total").sort(function(a, b) {
			return b.data.postRankTotalViews - a.data.postRankTotalViews;
		}).reverse();
	});

	return {
		"templateFormats": [
			"liquid",
			"md",
			"njk",
			"html"
		],
		"pathPrefix": "/web/",
		"passthroughFileCopy": true,
		"dataTemplateEngine": false,
		"htmlTemplateEngine": "liquid",
		"markdownTemplateEngine": "liquid"
	};
};