# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetPrintRequest*](#getprintrequest)
  - [*ListAvailablePrinters*](#listavailableprinters)
- [**Mutations**](#mutations)
  - [*CreatePrintRequest*](#createprintrequest)
  - [*UpdatePrintJobStatus*](#updateprintjobstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetPrintRequest
You can execute the `GetPrintRequest` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getPrintRequest(vars: GetPrintRequestVariables): QueryPromise<GetPrintRequestData, GetPrintRequestVariables>;

interface GetPrintRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetPrintRequestVariables): QueryRef<GetPrintRequestData, GetPrintRequestVariables>;
}
export const getPrintRequestRef: GetPrintRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPrintRequest(dc: DataConnect, vars: GetPrintRequestVariables): QueryPromise<GetPrintRequestData, GetPrintRequestVariables>;

interface GetPrintRequestRef {
  ...
  (dc: DataConnect, vars: GetPrintRequestVariables): QueryRef<GetPrintRequestData, GetPrintRequestVariables>;
}
export const getPrintRequestRef: GetPrintRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPrintRequestRef:
```typescript
const name = getPrintRequestRef.operationName;
console.log(name);
```

### Variables
The `GetPrintRequest` query requires an argument of type `GetPrintRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetPrintRequestVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetPrintRequest` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPrintRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetPrintRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPrintRequest, GetPrintRequestVariables } from '@dataconnect/generated';

// The `GetPrintRequest` query requires an argument of type `GetPrintRequestVariables`:
const getPrintRequestVars: GetPrintRequestVariables = {
  id: ..., 
};

// Call the `getPrintRequest()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPrintRequest(getPrintRequestVars);
// Variables can be defined inline as well.
const { data } = await getPrintRequest({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPrintRequest(dataConnect, getPrintRequestVars);

console.log(data.printRequest);

// Or, you can use the `Promise` API.
getPrintRequest(getPrintRequestVars).then((response) => {
  const data = response.data;
  console.log(data.printRequest);
});
```

### Using `GetPrintRequest`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPrintRequestRef, GetPrintRequestVariables } from '@dataconnect/generated';

// The `GetPrintRequest` query requires an argument of type `GetPrintRequestVariables`:
const getPrintRequestVars: GetPrintRequestVariables = {
  id: ..., 
};

// Call the `getPrintRequestRef()` function to get a reference to the query.
const ref = getPrintRequestRef(getPrintRequestVars);
// Variables can be defined inline as well.
const ref = getPrintRequestRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPrintRequestRef(dataConnect, getPrintRequestVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.printRequest);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.printRequest);
});
```

## ListAvailablePrinters
You can execute the `ListAvailablePrinters` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAvailablePrinters(vars?: ListAvailablePrintersVariables): QueryPromise<ListAvailablePrintersData, ListAvailablePrintersVariables>;

interface ListAvailablePrintersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: ListAvailablePrintersVariables): QueryRef<ListAvailablePrintersData, ListAvailablePrintersVariables>;
}
export const listAvailablePrintersRef: ListAvailablePrintersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAvailablePrinters(dc: DataConnect, vars?: ListAvailablePrintersVariables): QueryPromise<ListAvailablePrintersData, ListAvailablePrintersVariables>;

interface ListAvailablePrintersRef {
  ...
  (dc: DataConnect, vars?: ListAvailablePrintersVariables): QueryRef<ListAvailablePrintersData, ListAvailablePrintersVariables>;
}
export const listAvailablePrintersRef: ListAvailablePrintersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAvailablePrintersRef:
```typescript
const name = listAvailablePrintersRef.operationName;
console.log(name);
```

### Variables
The `ListAvailablePrinters` query has an optional argument of type `ListAvailablePrintersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAvailablePrintersVariables {
  capabilities?: string[] | null;
}
```
### Return Type
Recall that executing the `ListAvailablePrinters` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAvailablePrintersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAvailablePrintersData {
  printers: ({
    id: UUIDString;
    name: string;
    model: string;
    location?: string | null;
    capabilities?: string[] | null;
  } & Printer_Key)[];
}
```
### Using `ListAvailablePrinters`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAvailablePrinters, ListAvailablePrintersVariables } from '@dataconnect/generated';

// The `ListAvailablePrinters` query has an optional argument of type `ListAvailablePrintersVariables`:
const listAvailablePrintersVars: ListAvailablePrintersVariables = {
  capabilities: ..., // optional
};

// Call the `listAvailablePrinters()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAvailablePrinters(listAvailablePrintersVars);
// Variables can be defined inline as well.
const { data } = await listAvailablePrinters({ capabilities: ..., });
// Since all variables are optional for this query, you can omit the `ListAvailablePrintersVariables` argument.
const { data } = await listAvailablePrinters();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAvailablePrinters(dataConnect, listAvailablePrintersVars);

console.log(data.printers);

// Or, you can use the `Promise` API.
listAvailablePrinters(listAvailablePrintersVars).then((response) => {
  const data = response.data;
  console.log(data.printers);
});
```

### Using `ListAvailablePrinters`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAvailablePrintersRef, ListAvailablePrintersVariables } from '@dataconnect/generated';

// The `ListAvailablePrinters` query has an optional argument of type `ListAvailablePrintersVariables`:
const listAvailablePrintersVars: ListAvailablePrintersVariables = {
  capabilities: ..., // optional
};

// Call the `listAvailablePrintersRef()` function to get a reference to the query.
const ref = listAvailablePrintersRef(listAvailablePrintersVars);
// Variables can be defined inline as well.
const ref = listAvailablePrintersRef({ capabilities: ..., });
// Since all variables are optional for this query, you can omit the `ListAvailablePrintersVariables` argument.
const ref = listAvailablePrintersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAvailablePrintersRef(dataConnect, listAvailablePrintersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.printers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.printers);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreatePrintRequest
You can execute the `CreatePrintRequest` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPrintRequest(vars: CreatePrintRequestVariables): MutationPromise<CreatePrintRequestData, CreatePrintRequestVariables>;

interface CreatePrintRequestRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrintRequestVariables): MutationRef<CreatePrintRequestData, CreatePrintRequestVariables>;
}
export const createPrintRequestRef: CreatePrintRequestRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPrintRequest(dc: DataConnect, vars: CreatePrintRequestVariables): MutationPromise<CreatePrintRequestData, CreatePrintRequestVariables>;

interface CreatePrintRequestRef {
  ...
  (dc: DataConnect, vars: CreatePrintRequestVariables): MutationRef<CreatePrintRequestData, CreatePrintRequestVariables>;
}
export const createPrintRequestRef: CreatePrintRequestRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPrintRequestRef:
```typescript
const name = createPrintRequestRef.operationName;
console.log(name);
```

### Variables
The `CreatePrintRequest` mutation requires an argument of type `CreatePrintRequestVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePrintRequestVariables {
  materialId?: UUIDString | null;
  color?: string | null;
  fileDownloadUrl: string;
  modelFileName: string;
  notesFromUser?: string | null;
}
```
### Return Type
Recall that executing the `CreatePrintRequest` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePrintRequestData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePrintRequestData {
  printRequest_insert: PrintRequest_Key;
}
```
### Using `CreatePrintRequest`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPrintRequest, CreatePrintRequestVariables } from '@dataconnect/generated';

// The `CreatePrintRequest` mutation requires an argument of type `CreatePrintRequestVariables`:
const createPrintRequestVars: CreatePrintRequestVariables = {
  materialId: ..., // optional
  color: ..., // optional
  fileDownloadUrl: ..., 
  modelFileName: ..., 
  notesFromUser: ..., // optional
};

// Call the `createPrintRequest()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPrintRequest(createPrintRequestVars);
// Variables can be defined inline as well.
const { data } = await createPrintRequest({ materialId: ..., color: ..., fileDownloadUrl: ..., modelFileName: ..., notesFromUser: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPrintRequest(dataConnect, createPrintRequestVars);

console.log(data.printRequest_insert);

// Or, you can use the `Promise` API.
createPrintRequest(createPrintRequestVars).then((response) => {
  const data = response.data;
  console.log(data.printRequest_insert);
});
```

### Using `CreatePrintRequest`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPrintRequestRef, CreatePrintRequestVariables } from '@dataconnect/generated';

// The `CreatePrintRequest` mutation requires an argument of type `CreatePrintRequestVariables`:
const createPrintRequestVars: CreatePrintRequestVariables = {
  materialId: ..., // optional
  color: ..., // optional
  fileDownloadUrl: ..., 
  modelFileName: ..., 
  notesFromUser: ..., // optional
};

// Call the `createPrintRequestRef()` function to get a reference to the mutation.
const ref = createPrintRequestRef(createPrintRequestVars);
// Variables can be defined inline as well.
const ref = createPrintRequestRef({ materialId: ..., color: ..., fileDownloadUrl: ..., modelFileName: ..., notesFromUser: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPrintRequestRef(dataConnect, createPrintRequestVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.printRequest_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.printRequest_insert);
});
```

## UpdatePrintJobStatus
You can execute the `UpdatePrintJobStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePrintJobStatus(vars: UpdatePrintJobStatusVariables): MutationPromise<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;

interface UpdatePrintJobStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePrintJobStatusVariables): MutationRef<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;
}
export const updatePrintJobStatusRef: UpdatePrintJobStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePrintJobStatus(dc: DataConnect, vars: UpdatePrintJobStatusVariables): MutationPromise<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;

interface UpdatePrintJobStatusRef {
  ...
  (dc: DataConnect, vars: UpdatePrintJobStatusVariables): MutationRef<UpdatePrintJobStatusData, UpdatePrintJobStatusVariables>;
}
export const updatePrintJobStatusRef: UpdatePrintJobStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePrintJobStatusRef:
```typescript
const name = updatePrintJobStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdatePrintJobStatus` mutation requires an argument of type `UpdatePrintJobStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePrintJobStatusVariables {
  id: UUIDString;
  jobStatus: string;
}
```
### Return Type
Recall that executing the `UpdatePrintJobStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePrintJobStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePrintJobStatusData {
  printJob_update?: PrintJob_Key | null;
}
```
### Using `UpdatePrintJobStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePrintJobStatus, UpdatePrintJobStatusVariables } from '@dataconnect/generated';

// The `UpdatePrintJobStatus` mutation requires an argument of type `UpdatePrintJobStatusVariables`:
const updatePrintJobStatusVars: UpdatePrintJobStatusVariables = {
  id: ..., 
  jobStatus: ..., 
};

// Call the `updatePrintJobStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePrintJobStatus(updatePrintJobStatusVars);
// Variables can be defined inline as well.
const { data } = await updatePrintJobStatus({ id: ..., jobStatus: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePrintJobStatus(dataConnect, updatePrintJobStatusVars);

console.log(data.printJob_update);

// Or, you can use the `Promise` API.
updatePrintJobStatus(updatePrintJobStatusVars).then((response) => {
  const data = response.data;
  console.log(data.printJob_update);
});
```

### Using `UpdatePrintJobStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePrintJobStatusRef, UpdatePrintJobStatusVariables } from '@dataconnect/generated';

// The `UpdatePrintJobStatus` mutation requires an argument of type `UpdatePrintJobStatusVariables`:
const updatePrintJobStatusVars: UpdatePrintJobStatusVariables = {
  id: ..., 
  jobStatus: ..., 
};

// Call the `updatePrintJobStatusRef()` function to get a reference to the mutation.
const ref = updatePrintJobStatusRef(updatePrintJobStatusVars);
// Variables can be defined inline as well.
const ref = updatePrintJobStatusRef({ id: ..., jobStatus: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePrintJobStatusRef(dataConnect, updatePrintJobStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.printJob_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.printJob_update);
});
```

