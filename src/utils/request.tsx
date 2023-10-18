export async function nextFetch(
  url: string,
  type: string,
  body: any = undefined
) {
  if (body) {
    const result = await fetch(url, {
      method: type,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    console.log("nextFetch result");
    console.log(result);
    return result;
  } else {
    try {
      const result = await fetch(url, {
        method: type,
        mode: "cors",
        redirect: "follow",
      });
      console.log("nextFetch result");
      console.log(result);
      return result;
    } catch {
      return Response.error();
    }
  }
}
