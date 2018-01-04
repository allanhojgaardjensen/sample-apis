/*
  Helper function which validates correct combination of method and status code
*/
function _validStatusAndVerb(verb, status) {
    const statusCodeMap = {
      DELETE: ['204', '202', '301', '307', '400', '401', '403', '404', '406', '409', '410', '412', '415', '429', '500', '501', '503', '505'],
      GET: ['200', '202', '203', '206', '301', '302', '304', '307', '400', '401', '403', '404', '406', '409', '410', '412', '415', '429', '500', '501', '503', '505'],
      PATCH: ['202', '204', '301', '307', '400', '401', '403', '404', '406', '409', '410', '412', '415', '422', '429', '500', '501', '503', '505'],
      POST: ['201', '202', '301', '307', '400', '401', '403', '404', '406', '409', '410', '412', '415', '429', '500', '501', '503', '505'],
      PUT: ['201', '202', '301', '307', '400', '401', '403', '404', '406', '409', '410', '412', '415', '429', '500', '501', '503', '505']
    };

    if (status && status.toValue) {
      status = status.toValue();
    }

    if (verb && verb.toValue) {
      verb = verb.toValue();
    }

    if (statusCodeMap[verb].includes(status)) {
      return true;
    }
   return false;
  }

  /*
    Validates proper combinations of request method and response status code.

  @targets: Action
  @minim: true
  */
  function validateProperVerbStatusCode(action) {
    for (const transaction of action.transactions || []) {
      let stz = lodash.get(transaction, 'response.statusCode'),
      vrb = lodash.get(transaction, 'request.method');

      if (!_validStatusAndVerb(vrb, stz)) {
        return `Non-valid status code (${stz.toValue()}) for verb (${vrb.toValue()})`;
      }
    }
    return true;
  }

  /*
    Validates that a delete does not have a body associated with it

  @targets: Action
  @minim: true
  */
  function validateDeleteNoBody(action) {
    for (const transaction of action.transactions || []) {
      if (lodash.get(transaction, 'request.method', '').toValue().toLocaleLowerCase() === 'delete' && lodash.get(transaction, 'request.messageBody')) {
        return 'DELETE request must not have a body.';
      }
    }
    return true;
  }
  
  /*
    Validates that a consumer defined correlation is defined in the response.

  @targets: Action
  @minim: true
  */
  function validateProperCorellation(action) {
    for (const transaction of action.transactions || []) {
      const req = lodash.get(transaction, 'request.headers'),
            res = lodash.get(transaction, 'response.headers');            
      const strreq = JSON.stringify(req),
            strres = JSON.stringify(res);
        
      if (strreq && strreq.includes('X-Log-Token')) {
          if (strres && strres.includes('X-Log-Token')) {
              return true;
          }
          return 'A consumer defined correlation token includes X-Log-Token in response';
        }
      }
      return true;
    }

    /*
       Helper for checking header in headers
    */
    function _validResponseHeader(headers, header) {
      if (headers && headers.includes(header)) {
        return true;
      }
      return `Required ${header} not found`;
        
    }


  /*
    Validates that X-Log-Token is present in response headers

  @targets: Action
  @minim: true
  */
  function validateLogTokenInResponse(action) {
    for (const transaction of action.transactions || []) {
      const res = lodash.get(transaction, 'response.headers');
      const str = JSON.stringify(res);
      return _validResponseHeader(str, 'X-Log-Token');
      }
    return true;
    }

  /*
    Validates that Content-Type is part of response headers
  @targets: Action
  @minim: true
  */
  function validateContentTypeInResponse(action) {
    for (const transaction of action.transactions || []) {
      const res = lodash.get(transaction, 'response.headers');
      const str = JSON.stringify(res);
      return _validResponseHeader(str, 'Content-Type');
      }
    return false;
    }

