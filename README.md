
Fork of Zod-'s [jsVideoUrlParser](https://github.com/Zod-/jsVideoUrlParser/) that extracts info like id, channel, start time from YouTube urls.

# Building Locally
```
npm install
npm run lint
npm run test
npm run build
```

# npm
```
npm install parse-youtube-url-1andee
```

# bower
```shell
bower install parse-youtube-url-1andee
```

# Usage
## ES2015+ / Webpack
```
import urlParser from "parse-youtube-url-1andee";
```


## Parsing

Parsing a url will return a videoInfo object with all the information

```javascript
> urlParser.parse('http://www.youtube.com/watch?v=HRb7B9fPhfA')
{ mediaType: 'video',
  id: 'HRb7B9fPhfA',
  provider: 'youtube' }
```

Any url parameters expect for ids will be saved in the params object. Some
providers have special parameters for example the start parameter which dictates
at how many seconds the video starts. Special parameters can be found in the
different descriptions for the providers.
```javascript
> urlParser.parse('https://www.youtube.com/watch?v=6xLcSTDeB7A&index=25&list=PL46F0A159EC02DF82&t=1m40')
{
  provider: 'youtube',
  id: 'yQaAGmHNn9s',
  list: 'PL46F0A159EC02DF82',
  mediaType: 'video',
  params: {
    start: 100,
    index: '25'
  }
}
```

## Url Creation

The videoInfo objects can be turned back into urls with the `.create` function.
The required parameter for this is the videoInfo object itself. Optional ones are
the format of the url and the url parameters that should be added. Each provider
has it's own default format.

```javascript
> urlParser.create({
    videoInfo: {
      provider: 'youtube',
      id: 'HRb7B9fPhfA',
      mediaType: 'video'
    },
    format: 'long',
    params: {
      foo: 'bar'
    }
  })
'https://www.youtube.com/watch?foo=bar&v=HRb7B9fPhfA'
```
Parsing and creating can also be chained together to clean up an url for example.
If you still want to reuse the generated parameters object you can use the keyword
`'internal'` as params.

```javascript
> urlParser.create({
  videoInfo: urlParser.parse('https://youtube.com/watch?foo=bar&v=HRb7B9fPhfA')
})
'https://youtube.com/watch?v=HRb7B9fPhfA'

> urlParser.create({
  videoInfo: urlParser.parse('https://youtube.com/watch?foo=bar&v=HRb7B9fPhfA'),
  params: 'internal'
})
'https://youtube.com/watch?foo=bar&v=HRb7B9fPhfA'
```

# Plugins

## YouTube

#### Supported media types:
* `'video'`: Regular videos which can also be livestreams.
* `'playlist'`: YouTube playlist.
* `'share'`: Shared YouTube videos that link to a special website and are not actual videos themselves.

#### Supported url formats:
* `'short'`: Shortened urls.
* `'long'`(default): Regular urls.
* `'embed'`: Embedded urls.
* `'shortImage'`: Shortened thumbnail urls.
* `'longImage'`: Regular thumbnail urls.

#### Creating urls with different media types:

| mediaType/formats| short | long | embed | shortImage | longImage |
| ------------- | :--: | :--: | :--: | :--: | :--: |
| **video**    | ✓  | ✓  | ✓  | ✓  | ✓  |
| **playlist** | X  | ✓  | ✓  | X  | X  |
| **share**    | X  | ✓  | X  | X  | X  |

#### Special parameters:
* `'params.start'`: The number where the video should begin in seconds.
* `'params.imageQuality'`: Custom parameter for generating different qualities of thumbnail urls.
  * `'0', '1', '2', '3', 'default', 'hqdefault'(default), 'mqdefault', 'sddefault', 'maxresdefault'`

#### Parsing Examples:
```javascript
> urlParser.parse('http://www.youtube.com/watch?v=HRb7B9fPhfA');
> urlParser.parse('http://youtu.be/HRb7B9fPhfA');
> urlParser.parse('https://m.youtube.com/details?v=HRb7B9fPhfA');
> urlParser.parse('https://gdata.youtube.com/feeds/api/videos/HRb7B9fPhfA/related');
> urlParser.parse('https://i.ytimg.com/vi/HRb7B9fPhfA/hqdefault.jpg');
> urlParser.parse('https://img.youtube.com/vi/HRb7B9fPhfA/hqdefault.jpg');
{ mediaType: 'video',
  id: 'HRb7B9fPhfA',
  provider: 'youtube' }

> urlParser.parse('http://www.youtube.com/embed/videoseries?list=PL46F0A159EC02DF82');
> urlParser.parse('http://www.youtube.com/playlist?list=PL46F0A159EC02DF82');
{ mediaType: 'playlist',
    list: 'PL46F0A159EC02DF82',
    provider: 'youtube'}

> urlParser.parse('http://www.youtube.com/watch?v=yQaAGmHNn9s&list=PL46F0A159EC02DF82');
{ mediaType: 'video',
  id: 'yQaAGmHNn9s',
  list: 'PL46F0A159EC02DF82',
  provider: 'youtube'
}

> urlParser.parse('http://www.youtube.com/watch?v=yQaAGmHNn9s&list=PL46F0A159EC02DF82#t=1m40');
{ mediaType: 'video',
  id: 'yQaAGmHNn9s',
  list: 'PL46F0A159EC02DF82',
  provider: 'youtube'
  params: {
    start: 100
  }
}
```

#### Creation Examples:
```javascript
> urlParser.create({
    videoInfo: {
      provider: 'youtube',
      id: 'HRb7B9fPhfA',
      mediaType: 'video'
    },
    format: <format>
  })
'long': 'https://www.youtube.com/watch?v=HRb7B9fPhfA'
'short': 'https://youtu.be/HRb7B9fPhfA'
'embed': '//youtube.com/embed/HRb7B9fPhfA'
'shortImage': 'https://i.ytimg.com/vi/HRb7B9fPhfA/hqdefault.jpg'
'longImage': 'https://img.youtube.com/vi/HRb7B9fPhfA/hqdefault.jpg'

> urlParser.create({
    videoInfo: {
      provider: 'youtube',
      id: 'HRb7B9fPhfA',
      mediaType: 'video'
    },
    params: {
      start: 90
    },
    format: <format>
  })
'long': 'https://youtube.com/watch?v=HRb7B9fPhfA#t=90'
'short': 'https://youtu.be/HRb7B9fPhfA#t=90'
'embed': '//youtube.com/embed/HRb7B9fPhfA?start=90'

> urlParser.create({
    videoInfo: {
      provider: 'youtube',
      id: 'HRb7B9fPhfA',
      list: 'PL46F0A159EC02DF82',
      mediaType: 'video'
    },
    format: <format>
  })
'long': 'https://youtube.com/watch?list=PL46F0A159EC02DF82&v=HRb7B9fPhfA'
'embed': '//youtube.com/embed/HRb7B9fPhfA?list=PL46F0A159EC02DF82'

> urlParser.create({
    videoInfo: {
      provider: 'youtube',
      list: 'PL46F0A159EC02DF82',
      mediaType: 'playlist'
    },
    format: <format>
  })
'long': 'https://youtube.com/playlist?feature=share&list=PL46F0A159EC02DF82'
'embed': '//youtube.com/embed?list=PL46F0A159EC02DF82&listType=playlist'

> urlParser.create({
    videoInfo:  {
      provider: 'youtube',
      id: 'HRb7B9fPhfA',
      mediaType: 'video'
    },
    params:{
      imageQuality: <quality>
    },
    format: 'shortImage'
  })
'0': 'https://i.ytimg.com/vi/HRb7B9fPhfA/0.jpg'
'1': 'https://i.ytimg.com/vi/HRb7B9fPhfA/1.jpg'
'2': 'https://i.ytimg.com/vi/HRb7B9fPhfA/2.jpg'
'3': 'https://i.ytimg.com/vi/HRb7B9fPhfA/3.jpg'
'hqdefault': 'https://i.ytimg.com/vi/HRb7B9fPhfA/hqdefault.jpg'
'sddefault': 'https://i.ytimg.com/vi/HRb7B9fPhfA/sddefault.jpg'
'mqdefault': 'https://i.ytimg.com/vi/HRb7B9fPhfA/mqdefault.jpg'
'maxresdefault': 'https://i.ytimg.com/vi/HRb7B9fPhfA/maxresdefault.jpg'

> urlParser.create({
    videoInfo:  {
      provider: 'youtube',
      id: 'HRb7B9fPhfA',
      mediaType: 'video'
    },
    params:{
      imageQuality: <quality>
    },
    format: 'longImage'
  })
'0': 'https://img.youtube.com/vi/HRb7B9fPhfA/0.jpg'
'1': 'https://img.youtube.com/vi/HRb7B9fPhfA/1.jpg'
'2': 'https://img.youtube.com/vi/HRb7B9fPhfA/2.jpg'
'3': 'https://img.youtube.com/vi/HRb7B9fPhfA/3.jpg'
'hqdefault': 'https://img.youtube.com/vi/HRb7B9fPhfA/hqdefault.jpg'
'sddefault': 'https://img.youtube.com/vi/HRb7B9fPhfA/sddefault.jpg'
'mqdefault': 'https://img.youtube.com/vi/HRb7B9fPhfA/mqdefault.jpg'
'maxresdefault': 'https://img.youtube.com/vi/HRb7B9fPhfA/maxresdefault.jpg'
```