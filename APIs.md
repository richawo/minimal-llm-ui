## API's to the chat interface.

API Host: http://localhost:5329

### Generic Database Search

POST {{host}}/v1.0/sql/query
Content-Type: application/json
Accept: application/json

{
"query": "select content from \"view-9468964f-058a-4f2e-89ab-8b351ff082ba\" where document_guid = 'f49f92f7-8cdf-4f44-b327-0519e2aad881' and content LENGTH(content) > 5;",
"limit": 10
}

### Vector search

#### Request
* Headers
```text 
POST {{host}}/v1.0/vector/search
Content-Type: application/json
Accept: application/json
```

* BODY

```json
{
  "query": "What is the main topic?",
  "document_guid": "f49f92f7-8cdf-4f44-b327-0519e2aad881",
  "limit": 5
}
```

#### Response 
* Headers

```text
date: Fri, 18 Jul 2025 15:52:31 GMT
server: uvicorn
content-length: 1266
content-type: application/json
x-request-id: 95aa4000-9c28-4093-9265-db47a2dde78d
```

* Body

```json
{
  "status": "success",
  "query": "What is the main topic?",
  "document_guid": "f49f92f7-8cdf-4f44-b327-0519e2aad881",
  "limit": 5,
  "result_count": 5,
  "results": [
    {
      "id": 1,
      "content": "Reference guide",
      "length": 15,
      "distance": 0.6795133566276237
    },
    {
      "id": 1565,
      "content": "Enterprise",
      "length": 10,
      "distance": 0.7974459138448121
    },
    {
      "id": 363,
      "content": "1 . Serial number label pull tab 5 . NIC status LED 2 . Quick removal access panel 6 . UID button / LED 3 . Power On / Standby button and system power LED 7 . GPU cage ( 8 DW GPUs ) 4 . Health LED 8 . 1U drive cage ( up to 8 SFF or 8 EDSFF 1T drives ) Figure 1 . HPE ProLiant Compute DL380a Gen12 Server—Front system detail",
      "length": 323,
      "distance": 0.9242449513442739
    },
    {
      "id": 1079,
      "content": "Chat now ( sales )",
      "length": 18,
      "distance": 0.9243938094603021
    },
    {
      "id": 375,
      "content": "7 8 9 10 11 1 . Power supply for the system board 6 . Power supply for the system board 2 . Power supplies for GPU auxiliary power 7 . VGA 3 . Primary riser slots 1 - 3 8 . Two ( 2 ) USB 3 . 0 ports 4 . Secondary riser slots 4 - 6 9 . HPE iLO management port 5 . Power supplies for GPU auxiliary power 10 . OCP 3 . 0 slot 1 11 . OCP 3 . 0 slot 2 Figure 2 . HPE ProLiant Compute DL380a Gen12 Server—Rear system detail",
      "length": 416,
      "distance": 0.9250164240618253
    }
  ]
}
```