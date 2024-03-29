const noop = () => {};
const NO_PARAMS = {};
const NO_HEADERS = {};
const OK_200 = [200];

function request ({
    method = 'GET',
    url,
    params = NO_PARAMS,    
    headers = NO_HEADERS,
    body,
    okResponses = OK_200,
    responseType = 'json',
    requestType = 'json',
    onSuccess = noop,
    onError = noop,
}) {
    
    const req = new XMLHttpRequest();
   
    const urlParams = new URLSearchParams(params);
      
    const queryString = urlParams.toString();    
    req.open(method, url  + (queryString ? `?${queryString}` : ''));

    //console.log(`${url}?${queryString}`);

    Object.keys(headers).forEach((key) => {
        req.setRequestHeader(key, headers[key]);
    });

    req.responseType = responseType;

    req.onload = function (event) {
        const target = event.target;

        if (!okResponses.includes(target.status)) {            
            onError(target.statusText);
            return;
        }
        
        onSuccess(target.response);
    }
    req.onerror = function() {        
        onError();        
    }

    let dataBody = body;

    if (requestType === 'urlencoded') {
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        const bodyParams = new URLSearchParams(body);         
        dataBody = bodyParams.toString();        
    }

    if (requestType === 'json') {

        req.setRequestHeader('Content-Type', 'application/json');          
        dataBody = JSON.stringify(body);           

    }
        req.send(dataBody);   
};