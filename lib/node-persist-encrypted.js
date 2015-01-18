var crypto = require('crypto'),
    buffer = require('buffer');

module.exports = function(storage, passphrase){
    var self = this;

    var passphrase = new buffer.Buffer(passphrase);
    var protectKey = false, mainKey = false;

    this.verifyPassphrase = function(p){
        var pbuf = new buffer.Buffer(p);
        return Boolean(pbuf.toString('hex') == passphrase.toString('hex'));
    };

    // self configuration

    
    var constants = {
        SALT_SIZE: 64,
        KEY_SIZE: 64,
        HASH_ALGORITHM: 'sha512',
        ENCRYPT_ALGORITHM: 'aes-256-cbc',
        ITERATION: 10000,
    };
    function hash(buf){
        var hasher = crypto.createHash(constants.HASH_ALGORITHM);
        hasher.update(buf);
        return hasher.digest();
    };
    constants.HASH_SIZE = hash(new buffer.Buffer(0)).length;

    function setNewHeader(newPassphrase){
        var salt = crypto.randomBytes(constants.SALT_SIZE);
        protectKey = crypto.pbkdf2Sync(
            newPassphrase,
            salt,
            constants.ITERATION,
            constants.KEY_SIZE
        );
        storage.setItem(
            'header', 
            buffer.Buffer.concat([salt, hash(protectKey)]).toString('hex')
        );
    };


    // read header

    var header = storage.getItem('header');
    if(
        !header || 
        header.length != 2 * (constants.SALT_SIZE + constants.HASH_SIZE)
    ){
        // header not found, create a new one
        setNewHeader(passphrase);
    } else {
        // header found.
        var headerBuf = new buffer.Buffer(header, 'hex');
        var salt = headerBuf.slice(0, constants.SALT_SIZE),
            keyHash = headerBuf.slice(constants.SALT_SIZE);
        protectKey = crypto.pbkdf2Sync(
            passphrase,
            salt,
            constants.ITERATION,
            constants.KEY_SIZE
        );
        if(hash(protectKey).toString('hex') != keyHash.toString('hex'))
            throw Error('invalid-key');
    };


    // read main key
    
    var mainKeyEncrypted = storage.getItem('mainkey');
    function writeEncryptedMainKey(){
        var mainKeyEncipher = crypto.createCipher(
            constants.ENCRYPT_ALGORITHM,
            protectKey
        );
        var p1 = mainKeyEncipher.update(mainKey),
            p2 = mainKeyEncipher.final();
        var mainKeyEncryptedBuf = buffer.Buffer.concat([p1, p2]);
        storage.setItem('mainkey', mainKeyEncryptedBuf.toString('hex'));
    };
    if(mainKeyEncrypted && 0 == mainKeyEncrypted.length % 2){
        try{
            var mainKeyDecipher = crypto.createDecipher(
                constants.ENCRYPT_ALGORITHM,
                protectKey
            );
            var mainKeyEncryptedBuf = new buffer.Buffer(
                mainKeyEncrypted, 
                'hex'
            );
            var p1 = mainKeyDecipher.update(mainKeyEncryptedBuf),
                p2 = mainKeyDecipher.final();
            mainKey = buffer.Buffer.concat([p1, p2]);
        } catch(e){
        };
    };
    if(false === mainKey){
        // mainKey not found. either this is during a creation process, or
        // there is a serious unrecoverable error(data corruption). anyway,
        // we'll discard all data and create a new main key.
        mainKey = crypto.randomBytes(constants.KEY_SIZE);
        writeEncryptedMainKey(mainKey, protectKey);
    };


    // define storage function considering encryptions

    function hmac(buf){
        var hasher = crypto.createHmac(constants.HASH_ALGORITHM, mainKey);
        hasher.update(buf);
        return hasher.digest();
    };

    function hashKey(k){
        // deterministic.
        var kBuf = new buffer.Buffer(k);
        return hmac(kBuf).toString('hex');
    };

    function serialize(obj){
        var str = JSON.stringify(obj);
        var buf = new buffer.Buffer(str);
        var encipher = crypto.createCipher(
            constants.ENCRYPT_ALGORITHM,
            mainKey
        );
        var b1 = encipher.update(buf),
            b2 = encipher.final();
        return buffer.Buffer.concat([b1, b2]).toString('base64');
    };

    function unserialize(b64){
        try{
            var encryptedBuf = new buffer.Buffer(b64, 'base64');
            var decipher = crypto.createDecipher(
                constants.ENCRYPT_ALGORITHM,
                mainKey
            );
            var b1 = decipher.update(encryptedBuf),
                b2 = decipher.final();
            var buf = buffer.Buffer.concat([b1, b2]);
            var str = buf.toString();
            var obj = JSON.parse(str);
        } catch(e){
            return null;
        };
        return obj;
    };

    //////////////////////////////////////////////////////////////////////

    var reverseLookupTableKey = 'reverse-lookup-table';
    var reverseLookupTable = 
        unserialize(storage.getItem(reverseLookupTableKey)) || {};

    function updateReverseLookupTable(origKey, hashedKey){
        if(undefined !== origKey && undefined !== hashedKey)
            reverseLookupTable[hashedKey] = origKey;
        storage.setItem(reverseLookupTableKey, serialize(reverseLookupTable));
    };

    this.setItem = function(key, value){
        var ke = hashKey(key),
            ve = serialize(value);
        updateReverseLookupTable(key, ke);
        return storage.setItem(ke, ve);
    };

    this.getItem = function(key){
        var ke = hashKey(key);
        var ve = storage.getItem(ke);
        if(null == ve) return null;
        return unserialize(ve);
    };

    this.removeItem = function(key){
        var kes = [];
        for(var hashedKey in reverseLookupTable)
            if(key == reverseLookupTable[hashedKey]) kes.push(hashedKey);
        for(var i in kes){
            storage.removeItem(kes[i]);
            delete reverseLookupTable[kes[i]];
        };
        updateReverseLookupTable();
    };

    this.clear = function(){
        var kes = Object.keys(reverseLookupTable);
        for(var i in kes)
            storage.removeItem(kes[i]);
        reverseLookupTable = {};
        updateReverseLookupTable();
        
        mainKey = crypto.randomBytes(constants.KEY_SIZE);
        self.changePassphrase(passphrase);
        writeEncryptedMainKey();
        updateReverseLookupTable();
    };
    
    this.length = function(){
        return Object.keys(reverseLookupTable).length;
    };

    this.keys = function(){
        var hashedKeys = Object.keys(reverseLookupTable);
        hashedKeys.sort();
        var ret = [];
        for(var i in hashedKeys) ret.push(reverseLookupTable[hashedKeys[i]]);
        return ret;
    };

    this.changePassphrase = function(newPassphrase){
        passphrase = new buffer.Buffer(newPassphrase);
        setNewHeader(passphrase);
        writeEncryptedMainKey();
    };

    return this;
};
