
async function mockedApi(url: string) {
  if (url === 'user/name') {
    return 'John due';
  } else {
    throw new Error('invalid url');
  }
}

export type RequestUserResult = {
  type: 'name';
  data: string;
} | {
  type: 'error';
  error: Error;
}

async function requestUser(resource: string): Promise<RequestUserResult> {
  try {
    const userName = await mockedApi(`user/${resource}`);
    
    return { data: userName, type: 'name' };
  } catch (err) {
    if (err instanceof Error) {
      return { error: err, type: 'error' };
    }

    return { error: new Error('Unknow error: ' + JSON.stringify(err)), type: 'error' };
  }
}

requestUser('name')
.then(result => {
  if (result.type === 'name') {
    console.log(result.data);
  }
});