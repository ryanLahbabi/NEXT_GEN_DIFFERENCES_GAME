class Environnment {
  static const String ipAddress = "localhost";


  //PROD IP ADRESS and WS LINK
  static const String ipAddress =
      "ec2-3-99-141-60.ca-central-1.compute.amazonaws.com";
  // static const String wsLink =
  //     "http://ec2-3-99-141-60.ca-central-1.compute.amazonaws.com:2048";

  static const int httpPort = 3000;
  static const String httpLink = "http://$ipAddress:$httpPort/api";
  static const int wsPort = 2048;
  static const String wsLink = "ws://$ipAddress:$wsPort";
}
