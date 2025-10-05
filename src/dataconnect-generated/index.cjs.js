const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'rutgers-makerspace-hackru-2025',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createPrintRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrintRequest', inputVars);
}
createPrintRequestRef.operationName = 'CreatePrintRequest';
exports.createPrintRequestRef = createPrintRequestRef;

exports.createPrintRequest = function createPrintRequest(dcOrVars, vars) {
  return executeMutation(createPrintRequestRef(dcOrVars, vars));
};

const getPrintRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPrintRequest', inputVars);
}
getPrintRequestRef.operationName = 'GetPrintRequest';
exports.getPrintRequestRef = getPrintRequestRef;

exports.getPrintRequest = function getPrintRequest(dcOrVars, vars) {
  return executeQuery(getPrintRequestRef(dcOrVars, vars));
};

const updatePrintJobStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePrintJobStatus', inputVars);
}
updatePrintJobStatusRef.operationName = 'UpdatePrintJobStatus';
exports.updatePrintJobStatusRef = updatePrintJobStatusRef;

exports.updatePrintJobStatus = function updatePrintJobStatus(dcOrVars, vars) {
  return executeMutation(updatePrintJobStatusRef(dcOrVars, vars));
};

const listAvailablePrintersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailablePrinters', inputVars);
}
listAvailablePrintersRef.operationName = 'ListAvailablePrinters';
exports.listAvailablePrintersRef = listAvailablePrintersRef;

exports.listAvailablePrinters = function listAvailablePrinters(dcOrVars, vars) {
  return executeQuery(listAvailablePrintersRef(dcOrVars, vars));
};
