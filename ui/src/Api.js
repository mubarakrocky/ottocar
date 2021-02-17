import configData from './config.json'

export default class Api {
    static get(path) {
        function callApi(resolve, reject) {
            fetch(configData.SERVER_URL + path)
                .then(res => res.json())
                .then((result) => {
                    if (result.status) {
                        resolve(result.data)
                    } else {
                        alert(result.message)
                        reject(result.message)
                    }
                }, (error) => {
                    alert(error)
                    reject(error)
                })
        }

        return new Promise(callApi)
    }

    static put(path, body) {
        function callApi(resolve, reject) {
            fetch(configData.SERVER_URL + path, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(res => res.json())
                .then((result) => {
                    if (result.status) {
                        resolve(result.data)
                    } else {
                        alert(result.message)
                        reject(result.message)
                    }
                }, (error) => {
                    alert(error)
                    reject(error)
                })
        }

        return new Promise(callApi)
    }
}
