/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 * @class sails.config
 */
module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

  cloudmapsEmails: {
    // Адрес отправителя письма с подтверждением почты пользователя:
    confirmation: 'test@cloudmaps.ru'
  },

  authentication: {
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhL8r1atQQWWgL8XxxT37
7HnMoApLCGXMdqVoKtdD3qhObNo3zOqvlw3BNUJxjHko8kCwelcHfQifReauUz2M
shtxApq0Gylm9oAEuegsP4jSTDcsHG87bLQVnbWPkAOuzh//SF7WDw4zVubbf7K6
D4jQdGnEp8IbS/CjQwOcLrWCrJUeE153cTazQ0BJHgsteCnwb3KBhC+eA7T4WuYY
fqBwjj2bS/AMdxUC2G4K2TiibScrOy5a07idCorv7ZAMvBo3keAZa9/mKbcR8fDm
alJq+rtx+AU1uKQuAxencaTAD49S7Y7PMCHc3AmXwc7wK58sfd9J3mY3QMBJhLKP
GQIDAQAB
-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAhL8r1atQQWWgL8XxxT377HnMoApLCGXMdqVoKtdD3qhObNo3
zOqvlw3BNUJxjHko8kCwelcHfQifReauUz2MshtxApq0Gylm9oAEuegsP4jSTDcs
HG87bLQVnbWPkAOuzh//SF7WDw4zVubbf7K6D4jQdGnEp8IbS/CjQwOcLrWCrJUe
E153cTazQ0BJHgsteCnwb3KBhC+eA7T4WuYYfqBwjj2bS/AMdxUC2G4K2TiibScr
Oy5a07idCorv7ZAMvBo3keAZa9/mKbcR8fDmalJq+rtx+AU1uKQuAxencaTAD49S
7Y7PMCHc3AmXwc7wK58sfd9J3mY3QMBJhLKPGQIDAQABAoIBACwxYKx/nfZHmO6O
nZCmtAnj+qWFB7nB+jG9m1I33BZyPbmrZExKDS7im2HZvuefJmyP8LCp7IpJpoyk
4YBAy2g4DoVpb3Bjdi22LNyfWKvGJwzMiVjmBwiHY3LfkO3G7BkfOeOj/uuANMNH
k+eNXrfxOkSnOZsH2gKMGC4lM4ew1sOKh+ecaBOal9PFp8wRoMdMI/FjrORTe2Hm
VPSTGR7Gq9XBaB40f0SRupojePIAFexcfC8D2g3smMV5gJebz81Hj5U8oLfp5TU0
7etsJapVtK4Igm+HYzyD99pMPAfCMl+M1scAlHZ2JkI0sHunxQO4esZgtnyl8hCH
ufPw2aECgYEAxgEY/2o6QhAbk286ZMsKXYHuQTxJFezNCtqYobHNL1wCjveQrfjg
ecnhilr0R5lwdf3Kxe4p0S+VwP/fh1SRm0Za+7uoB1CGrMXqg1DwKFcBFuX9RWal
WNfuLmEWJujlAgHAJ647WakSNcwjTTlIV9L0YwwyO8p2RzzhJrGdYxUCgYEAq6Di
1znVnyTz2PQ5wjro0bwGSF+iz6Fsq0SwB2b9k0t/mg57k+WUqOMdwATI4VcAhLZL
5GE45zTHPJti8S9paX3rw4NI35+Nutf1WlEw+kMmiVSVDf13A/+IQeBtPA7WAsqV
//PvPQfXEMax/7eG5G6RUczHxgrHtP2JvAUmzPUCgYALIuirBOh96rYCVtEr9heB
Jtulo6RgrU7i+2R2Q6/MqBokvFvQzRyi/O3IgFEY7dJbcIjFFR4Y+9oqXrnNvL3r
w8s+OVG8B5Vrhj4oYJcBTdNr3EegbaODGbH1vdQnIBYxRLPwB2ajJlU13WNm5n/h
IKZKI9d3cW2xmAT5zieR+QKBgFedWi/lJliH1LP8eT/eMtxe0BZCPCsijQchmXst
6GU5NXq/yfZGTQ2qY5WS27mtYGZfaX684v+kwdD+whO90GI6FhFJA/qkyQWJGYdx
yz726MVSmIT7z7YKzNRUbW8rY7UpFkoDjS3qwq+dv2B7oDEdALJxh8ph1nFevOFu
/8/BAoGAHPSyHn8yBr/lph1TWYuXAfe14yQ86s7LbvAgu2tyWpPZ0v28svbyszGd
hLXN56FS3NpsChZKx0dCCtDMxzMFik7u5J6I1+38qJwm68W7DEGiuE/uzqKbtR3D
hUlCzRRAEYnTQVsiSuQfZedgaW3KdzjbHLULe46gwkuIzADf4Ig=
-----END RSA PRIVATE KEY-----`
  }
};
