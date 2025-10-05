import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'rutgers-makerspace-hackru-2025',
  location: 'us-central1'
};

export const createPrintRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrintRequest', inputVars);
}
createPrintRequestRef.operationName = 'CreatePrintRequest';

export function createPrintRequest(dcOrVars, vars) {
  return executeMutation(createPrintRequestRef(dcOrVars, vars));
}

export const getPrintRequestRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPrintRequest', inputVars);
}
getPrintRequestRef.operationName = 'GetPrintRequest';

export function getPrintRequest(dcOrVars, vars) {
  return executeQuery(getPrintRequestRef(dcOrVars, vars));
}

export const updatePrintJobStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePrintJobStatus', inputVars);
}
updatePrintJobStatusRef.operationName = 'UpdatePrintJobStatus';

export function updatePrintJobStatus(dcOrVars, vars) {
  return executeMutation(updatePrintJobStatusRef(dcOrVars, vars));
}

export const listAvailablePrintersRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAvailablePrinters', inputVars);
}
listAvailablePrintersRef.operationName = 'ListAvailablePrinters';

export function listAvailablePrinters(dcOrVars, vars) {
  return executeQuery(listAvailablePrintersRef(dcOrVars, vars));
}

