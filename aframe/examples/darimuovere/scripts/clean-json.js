const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('../data/cart_item.json', 'utf8'));

const cleanedObj = [];

const getCoordinatesFromAddress = async (elem) => {
    const googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyCAuqr6vZroeGqQaS1beL_e3SLaqFJd_no',
        Promise: Promise,
    });

    return googleMapsClient.geocode({ address: `${elem.realname} ${elem.indirizzo + ' , Bologna'}` })
        .asPromise()
        .then((response) => {
            if (!response.json.results[0] || !response.json.results[0].geometry.location) {
                return null;
            }

            let location = response.json.results[0].geometry.location;
            elem.geocode = `${location.lat}, ${location.lng}`;
            return Promise.resolve();

        })
        .catch((err) => {
            console.log(err);
        });
};

const toFetch = [];

obj.forEach(async (elem) => {
    // do not consider draft objects
    if (elem.status === 'draft') {
        draft.push(elem)
        return;
    }

    var obj = {
        id: elem.ID,
        fullname: elem.realname,
        title: elem.titolo,
        header: elem.intestazione,
        nickname: elem.nickname,
        description: elem.testo,
        address: elem.indirizzo + ' , Bologna',
        geocode: elem.geocode,
    };

    if (!elem.geocode) {
        toFetch.push(obj);
    } else {
        cleanedObj.push(obj);
    }
});


Promise.all(toFetch.map((elem) => getCoordinatesFromAddress(elem)))
    .then((res) => {
        const objects = [...cleanedObj, ...toFetch];
        const json = JSON.stringify(objects);
        fs.writeFileSync('../data/data.json', json, 'utf8');
    })

