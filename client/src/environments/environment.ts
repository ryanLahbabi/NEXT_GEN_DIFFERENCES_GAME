// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// const ip = 'localhost';
// const ip = '142.113.15.241'; // New server
const ip = 'ec2-3-99-141-60.ca-central-1.compute.amazonaws.com';
// const ip = '70.31.242.56'; // Old server
// const ip = '10.0.0.244';

export const environment = {
    production: false,
    serverUrl: `http://${ip}:3000/api`,
    socketUrl: `http://${ip}:2048`,
    //  serverGatewayUrl: 'ws://ec2-99-79-67-121.ca-central-1.compute.amazonaws.com:2048',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */

// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
// socketUrl: 'http://localhost:2048',
// serverUrl: 'http://localhost:3000/api',
