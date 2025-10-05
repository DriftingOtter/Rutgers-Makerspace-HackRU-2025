# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createPrintRequest, getPrintRequest, updatePrintJobStatus, listAvailablePrinters } from '@dataconnect/generated';


// Operation CreatePrintRequest:  For variables, look at type CreatePrintRequestVars in ../index.d.ts
const { data } = await CreatePrintRequest(dataConnect, createPrintRequestVars);

// Operation GetPrintRequest:  For variables, look at type GetPrintRequestVars in ../index.d.ts
const { data } = await GetPrintRequest(dataConnect, getPrintRequestVars);

// Operation UpdatePrintJobStatus:  For variables, look at type UpdatePrintJobStatusVars in ../index.d.ts
const { data } = await UpdatePrintJobStatus(dataConnect, updatePrintJobStatusVars);

// Operation ListAvailablePrinters:  For variables, look at type ListAvailablePrintersVars in ../index.d.ts
const { data } = await ListAvailablePrinters(dataConnect, listAvailablePrintersVars);


```