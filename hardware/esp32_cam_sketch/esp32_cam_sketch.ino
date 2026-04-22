#include <ESP8266WiFi.h>

const char* ssid = "Maadesh";
const char* password = "om bhat swaha";

WiFiServer server(80);

#define LED LED_BUILTIN

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  digitalWrite(LED, HIGH);

  Serial.println();
  Serial.print("Connecting to WiFi");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  Serial.println("New Client");

  String request = client.readStringUntil('\r');
  Serial.println(request);
  client.flush();

  if (request.indexOf("/LED=ON") != -1) {
    digitalWrite(LED, LOW);
  }
  if (request.indexOf("/LED=OFF") != -1) {
    digitalWrite(LED, HIGH);
  }

  // HTML Page
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");

  client.println("<!DOCTYPE html>");
  client.println("<html>");
  client.println("<head>");
  client.println("<title>NodeMCU Control</title>");
  client.println("<style>");
  client.println("body { text-align: center; font-family: Arial; }");
  client.println("button { padding: 20px; font-size: 20px; margin: 10px; }");
  client.println("</style>");
  client.println("</head>");

  client.println("<body>");
  client.println("<h1>ESP8266 Web Server</h1>");
  client.println("<p><a href=\"/LED=ON\"><button>ON</button></a></p>");
  client.println("<p><a href=\"/LED=OFF\"><button>OFF</button></a></p>");
  client.println("</body>");
  client.println("</html>");

  delay(1);
  Serial.println("Client disconnected");
}