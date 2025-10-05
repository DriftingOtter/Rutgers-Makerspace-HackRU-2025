import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreatePrintRequestData {
  printRequest_insert: PrintRequest_Key;
}

export interface CreatePrintRequestVariables {
  materialId?: UUIDString | null;
  color?: string | null;
  fileDownloadUrl: string;
  modelFileName: string;
  notesFromUser?: string | null;
}

export interface GetPrintRequestData {
  printRequest?: {
    id: UUIDString;
    material?: {
      id: UUIDString;
      name: string;
    } & Material_Key;
      color?: string | null;
      fileDownloadUrl?: string | null;
      modelFileName: string;
      notesFromUser?: string | null;
      printStatus: string;
      requester: {
        id: UUIDString;
        displayName: string;
      } & User_Key;
  } & PrintRequest_Key;
}

export interface GetPrintRequestVariables {
  id: UUIDString;
}

export interface ListAvailablePrintersData {
  printers: ({
    id: UUIDString;
    name: string;
    model: string;
    location?: string | null;
    capabilities?: string[] | null;
  } & Printer_Key)[];
}

export interface ListAvailablePrintersVariables {
  capabilities?: string[] | null;
}

export interface Material_Key {
  id: UUIDString;
  __typename?: 'Material_Key';
}

export interface PrintJob_Key {
  id: UUIDString;
  __typename?: 'PrintJob_Key';
}

export interface PrintRequest_Key {
  id: UUIDString;
  __typename?: 'PrintRequest_Key';
}

export interface Printer_Key {
  id: UUIDString;
  __typename?: 'Printer_Key';
}

export interface UpdatePrintJobStatusData {
  printJob_update?: PrintJob_Key | null;
}

export interface UpdatePrintJobStatusVariables {
  id: UUIDString;
  jobStatus: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreatePrintRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrintRequestVariables): MutationRef<CreatePrintRequestData, CreatePrintRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePrintRequestVariables): MutationRef<CreatePrintRequestData, CreatePrintRequestVariables>;
  operationName: string;
}
export const createPrintRequestRef: CreatePrintRequestRef;

export function createPrintRequest(vars: CreatePrintRequestVariables): MutationPromise<CreatePrintRequestData, CreatePrintRequestVariables>;
export function createPrintRequest(dc: DataConnect, vars: CreatePrintRequestVariables): MutationPromise<CreatePrintRequestData, CreatePrintRequestVariables>;

interface GetPrintRequestRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPrintRequestVariables): QueryRef<GetPrintRequestData, GetPrintRequestVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetPrintRequestVariables): QueryRef<GetPrintRequestData, GetPrintRequestVariables>;
  operationName: string;
}
export const getPrintRequestRef: GetPrintRequestRef;

export function getPrintRequest(vars: GetPrintRequestVariables): QueryPromise<GetPrintRequestData, GetPrintRequestVariables>;
export function getPrintRequest(dc: DataConnect, vars: GetPrintRequestVariables): QueryPromise<GetPrintRequestData, GetPrintRequestVariables>;

interface UpdatePrintJobStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePrintJobStatusVariables): MutationRef<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePrintJobStatusVariables): MutationRef<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;
  operationName: string;
}
export const updatePrintJobStatusRef: UpdatePrintJobStatusRef;

export function updatePrintJobStatus(vars: UpdatePrintJobStatusVariables): MutationPromise<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;
export function updatePrintJobStatus(dc: DataConnect, vars: UpdatePrintJobStatusVariables): MutationPromise<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;

interface ListAvailablePrintersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListAvailablePrintersVariables): QueryRef<ListAvailablePrintersData, ListAvailablePrintersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars?: ListAvailablePrintersVariables): QueryRef<ListAvailablePrintersData, ListAvailablePrintersVariables>;
  operationName: string;
}
export const listAvailablePrintersRef: ListAvailablePrintersRef;

export function listAvailablePrinters(vars?: ListAvailablePrintersVariables): QueryPromise<ListAvailablePrintersData, ListAvailablePrintersVariables>;
export function listAvailablePrinters(dc: DataConnect, vars?: ListAvailablePrintersVariables): QueryPromise<ListAvailablePrintersData, ListAvailablePrintersVariables>;

