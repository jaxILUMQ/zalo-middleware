# zalo-middleware

Simple middleware Zalo User Access Token

### Installation

```sh
$ npm install zalo-middleware
```

### Usage

```sh
// Import
const express = require('express');
const router = express.Router();
const Zalo = require('zalo-middleware');

// Declare config
const zalo = new Zalo({
    // Your app id
    app_id: '958618946106623643',
    // Your app serect
    app_secret: 'MIY1cTxKt13IjmRMEKSQ',
    // Success redirect
    redirect_uri: 'https://localhost:8443/auth/zalo/callback',
    // Failure redirect
    redirect_uri_user_denied: 'https://localhost:8443'
});

// Request permission
router.get('/auth/zalo', zalo.requestAccessFromUser());

// Get AccessToken, ProfileUser
router.get(
    '/auth/zalo/callback',
    zalo.requestAccessToken(),
    zalo.requestProfileUser(),
    (req, res) => {
        // Anything you want
        const myData = req.zalo;
        res.json(myData);
    }
);

```

### Tips

You can create a https server by using https://www.npmjs.com/package/pem

## License

MIT

**Free Software, Hell Yeah!**
