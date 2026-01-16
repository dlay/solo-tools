import * as express from 'express';
import { v4 as uuidV4 } from 'uuid';
import { expressCspHeader, INLINE, NONE, SELF } from 'express-csp-header';
import * as path from 'path';
import * as AWS from 'aws-sdk';
import * as bodyParser from 'body-parser';
import fetch, { Response } from 'node-fetch';
import { URLSearchParams } from 'url';
import * as jwt from 'jsonwebtoken';

// import Discord from 'discord.js';
const Discord = require('discord.js');
const discordClient = new Discord.Client();

discordClient.once('ready', () => {
  console.log('discord client ready.');
  console.log('discord client ready.');
});

discordClient.on('guildMemberUpdate', (oldMember: any, newMember: any) => {
  // console.log(newMember._roles);
  // console.log(newMember.user);
  const eav: Record<string, any> = {};
  const ean: Record<string, any> = {};
  const updateExp = 'set #permissions = :permissions';
  ean['#permissions'] = 'permissions';
  eav[':permissions'] = 0;
  if (newMember._roles.indexOf('868770374719004742') > -1) {
    eav[':permissions'] = 1;
  }
  if (newMember._roles.indexOf('868771528270032926') > -1) {
    eav[':permissions'] = 2;
  }
  dynamoDB
    .update({
      TableName: 'user',
      Key: { uid: newMember.user.id },
      UpdateExpression: updateExp,
      ExpressionAttributeNames: ean,
      ExpressionAttributeValues: eav
    })
    .promise()
    .then((out) => {
      console.log('member permissions updated.');
    })
    .catch((err) => {
      // console.log(err);
    });
});

discordClient.login('secret');

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION || 'eu-central-1'
});

/* dynamoDB
  .get({
    TableName: 'marker',
    Key: { uid: 'q1w2e3r4', type: 'gather' }
  })
  .promise()
  .then((res) => console.log(res))
  .catch(console.error); */

const app: express.Application = express();
// rate limiter?
// app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(expressCspHeader({
  directives: {
    'default-src': [SELF, 'https://discord.com/'],
    'img-src': [SELF, INLINE, 'https://cdn.discordapp.com/'],
    'style-src': [SELF, INLINE, 'http://www.w3.org/'],
    'script-src': [SELF],
    'connect-src': [SELF, 'https://discord.com/']
  }
}));
const PORT = process.env.PORT || 8080;
const clientId = '868712448633495582';
const clientSecret = 'secret';

app.post('/api/marker/:id', (req: express.Request, res: express.Response) => {
  if (!/[A-Za-z0-9_-]*/.test(req.params.id)) {
    return res.status(400).send('Error: Bad Request.');
  }
  const tmp: Record<string, any> = {
    dungeon: true,
    hunt: true,
    fish: false,
    collectible: false,
    poi: false,
    treasure: true,
    monster: true,
    gather: {
      hc_002: {
        isShown: true
      },
      hc_003: {
        isShown: false
      },
      hc_005: {
        isShown: true
      }
    }
  };
  const expValues: Record<string, any> = {
    ':map_id': req.params.id
  };
  let typeFilter = '';
  let materialFilter = '';
  let fishFilter = '';
  // let filterExp = 'contains(#map_id, :map_id)';
  let filterExp = '(#map_id IN (:map_id))';
  const expNames: Record<string, any> = {
    '#map_id': 'map_id'
  };
  let hideAll = true;
  if (Object.keys(req.body).length > 0) {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === true) {
        typeFilter +=  `:${key}, `;
        expValues[':' + key] = key;
        hideAll = false;
      }
    });
    if (req.body.gather) {
      Object.keys(req.body.gather).forEach((key) => {
        if (req.body.gather[key].isShown === true) {
          materialFilter +=  `:${key}, `;
          expValues[':' + key] = key;
          hideAll = false;
        }
      });
    }
    if (req.body.fish) {
      Object.keys(req.body.fish).forEach((key) => {
        if (req.body.fish[key].isShown === true) {
          fishFilter +=  `:${key}, `;
          expValues[':' + key] = key;
          hideAll = false;
        }
      });
    }
  } else {
    hideAll = false;
  }

  if (typeFilter.length > 0 || materialFilter.length > 0 || fishFilter.length > 0) {
    filterExp += ' AND (';
  }

  if (typeFilter.length > 0) {
    filterExp += `#type IN (${typeFilter.slice(0, -2)})`;
    expNames['#type'] = 'type';
    if (materialFilter.length > 0 || fishFilter.length > 0) {
      filterExp += ' OR ';
    }
  }

  if (materialFilter.length > 0) {
    filterExp += `#material IN (${materialFilter.slice(0, -2)})`;
    expNames['#material'] = 'material';
    if (fishFilter.length > 0) {
      filterExp += ' OR ';
    }
  }

  if (fishFilter.length > 0) {
    filterExp += `#fish IN (${fishFilter.slice(0, -2)})`;
    expNames['#fish'] = 'fish';
  }

  if (materialFilter.length > 0 || fishFilter.length > 0 || typeFilter.length > 0) {
    filterExp += ')';
  }

  if (hideAll) {
    return res.status(200).send([]);
  }
  dynamoDB
    .scan({
      TableName: 'marker',
      FilterExpression: filterExp,
      ExpressionAttributeNames: expNames,
      ExpressionAttributeValues: expValues
    })
    .promise()
    .then((out) => {
      return res.status(200).send(out.Items);
    })
    .catch((err) => {
      return res.status(500).send(err);
    });
});

app.post('/api/marker', verifyToken, (req: express.Request, res: express.Response) => {
  // @ts-ignore
  if (req.user?.permissons <= 0) {
    return res.sendStatus(403);
  }
  if (!req.body.hasOwnProperty('type')
    || !req.body.hasOwnProperty('map')
    || !req.body.hasOwnProperty('position')) {
    return res.status(400).send('Error: property missing.');
  }
  if (!req.body.position.hasOwnProperty('top') || !req.body.position.hasOwnProperty('left')) {
    return res.status(400).send('Error: property missing.');
  }

  const marker = {
    uid: uuidV4(),
    type: req.body.type,
    map_id: req.body.map,
    position: {
      top: req.body.position.top,
      left: req.body.position.left,
    },
    timestamp: new Date().toString()
  };

  dynamoDB
    .put({
      TableName: 'marker',
      Item: marker
    })
    .promise()
    .then((out) => {
      return res.status(200).send(marker);
    })
    .catch(() => {
      return res.status(500).send('Error: Internal Server Error');
    });
});

app.put('/api/marker/:uid', verifyToken, (req: express.Request, res: express.Response) => {
  // @ts-ignore
  if (req.user?.permissons <= 0) {
    return res.sendStatus(403);
  }
  const uid = req.params.uid;
  const type = req.body.type;
  const description = req.body.description;
  const material = req.body.material;
  const fish = req.body.fish;
  if (!uid || !type) {
    return res.status(400).send('Error: property missing.');
  }
  const eav: Record<string, any> = {};
  const ean: Record<string, any> = {};
  let updateExp = 'set ';

  if (material) {
    ean['#material'] = 'material';
    eav[':material'] = material;
    updateExp += '#material = :material, ';
  }

  if (fish) {
    ean['#fish'] = 'fish';
    eav[':fish'] = fish;
    updateExp += '#fish = :fish, ';
  }

  if (description) {
    ean['#description'] = 'description';
    eav[':description'] = description;
    updateExp += '#description = :description, ';
  }

  if ( updateExp.length <= 4) {
    return res.status(400).send('Error: property missing.');
  } else {

  }

  dynamoDB
    .update({
      TableName: 'marker',
      Key: { uid, type },
      UpdateExpression: updateExp.slice(0, -2),
      ExpressionAttributeNames: ean,
      ExpressionAttributeValues: eav
    })
    .promise()
    .then((out) => {
      return res.status(200).send(out);
    })
    .catch((err) => {
      return res.status(500).send('Error: Internal Server Error');
    });
});

app.delete('/api/marker/:uid', verifyToken, (req: express.Request, res: express.Response) => {
  // @ts-ignore
  if (req.user?.permissons <= 0) {
    return res.sendStatus(403);
  }
  const uid = req.params.uid;
  const type = req.query.type;
  if (!uid || !type) {
    return res.status(400).send('Error: property missing.');
  }

  dynamoDB
    .delete({
      TableName: 'marker',
      Key: { uid, type }
    })
    .promise()
    .then((out) => {
      return res.status(200).send(out);
    })
    .catch(() => {
      return res.status(500).send('Error: Internal Server Error');
    });
});

app.get('/api/user', verifyToken, (req: express.Request, res: express.Response) => {
  res.send(req.user);
});

app.get('/api/discord/callback', async (req: express.Request, res: express.Response, next) => {
  const code = req.query.code as string;
  if (code) {
    try {
      const oauthResult: Response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          scope: 'identify',
          redirect_uri: 'https://solo-tools.com/api/discord/callback'
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const oauthData = await oauthResult.json();

      const userResult: Response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`
        }
      });
      const userData = await userResult.json();
      const newUser = {
        uid: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        locale: userData.locale,
        permissions: 0,
        first_login: new Date().toString()
      };

      const eav: Record<string, any> = {};
      const ean: Record<string, any> = {};
      let updateExp = 'set ';
      ean['#username'] = 'username';
      eav[':username'] = userData.username;
      updateExp += '#username = :username, ';
      ean['#discriminator'] = 'discriminator';
      eav[':discriminator'] = userData.discriminator;
      updateExp += '#discriminator = :discriminator, ';
      ean['#avatar'] = 'avatar';
      eav[':avatar'] = userData.avatar;
      updateExp += '#avatar = :avatar';

      dynamoDB
        .get({
          TableName: 'user',
          Key: { uid: newUser.uid }
        })
        .promise()
        .then((out) => {
          if (!out.Item) {
            dynamoDB
              .put({
                TableName: 'user',
                Item: newUser
              })
              .promise()
              .then((outPut) => {
              })
              .catch((e) => {
                console.log(e);
              });
          } else {
            dynamoDB
              .update({
                TableName: 'user',
                Key: { uid: newUser.uid },
                UpdateExpression: updateExp,
                ExpressionAttributeNames: ean,
                ExpressionAttributeValues: eav
              })
              .promise()
              .then((outPut) => {
              })
              .catch((e) => {
                console.log(e);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
      // create session?

      const token = jwt.sign(newUser, 'tokensecret', { expiresIn: 60 * 60 * 24 * 7 });
      // res.cookie('SESSIONID', token, { httpOnly: true, secure: true });
      // jwt.decode()
      return res.redirect(`/?token=${token}`);
    } catch (e) {
      console.log(e);
    }
  }
  // res.sendFile(path.join(__dirname, '../dist/solo_map/index.html'));
  res.redirect(`/`);
});

app.use('/map', express.static(path.join(__dirname, '../dist/solo_map')));
app.use('/about', express.static(path.join(__dirname, '../dist/solo_map')));
app.use('/privacy', express.static(path.join(__dirname, '../dist/solo_map')));
app.use('/', express.static(path.join(__dirname, '../dist/solo_map')));

app.listen(PORT, () => {
  console.log('Server started.');
});

function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const bearerHeader = req.header('authorization');
  if (!bearerHeader) {
    res.sendStatus(403);
    return;
  }
  const token = bearerHeader.split(' ')[1];
  if (!token) {
    res.sendStatus(403);
    return;
  }
  try {
    req.user = jwt.verify(token, 'tokensecret');
    // @ts-ignore
    const uid = req.user.uid;
    if (!uid) {
      res.sendStatus(403);
      return;
    }
    dynamoDB
      .get({
        TableName: 'user',
        Key: { uid }
      })
      .promise()
      .then((out) => {
        req.user = out.Item;
        next();
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(403);
        return;
      });
  } catch (e) {
    res.status(401).send(e);
    return;
  }
}
