process.env.NODE_ENV = 'test';

var should = require('should');
var assert = require('assert');
var pcap = require('pcap');
var sinon = require('sinon');
var events = require('events');
var fake_session = sinon.stub(pcap, 'createSession',function () {
            session = new events.EventEmitter();
            return session;
        });
var dash_button = require('../index.js');

var hex = '8f:3f:20:33:54:44';
var hex2 = '8f:3f:20:33:54:43';
var hex3 = '8f:3f:20:33:54:42';
var int_array = [];
var packet1 = createMockArpProbe(hex);
var packet2 = createMockArpProbe(hex2);
var packet3 = createMockArpProbe(hex3);
//var arp = require('arpjs');
// var sendarp = function(){
//     arp.send({
//     'op': 'request',
//     'src_ip': '10.105.50.100',
//     'dst_ip': '10.105.50.1',
//     'src_mac': hex,
//     'dst_mac': 'ff:ff:ff:ff:ff:ff'
//     });  
// };
// var sendarp2 = function(){
//     arp.send({
//     'op': 'request',
//     'src_ip': '10.105.50.100',
//     'dst_ip': '10.105.50.1',
//     'src_mac': hex2,
//     'dst_mac': 'ff:ff:ff:ff:ff:ff'
//     });  
// };
// var sendarp3 = function(){
//     arp.send({
//     'op': 'request',
//     'src_ip': '10.105.50.100',
//     'dst_ip': '10.105.50.1',
//     'src_mac': hex3,
//     'dst_mac': 'ff:ff:ff:ff:ff:ff'
//     });  
// };
function createMockArpProbe(sourceMacAddress) {
  var decimals = sourceMacAddress.split(':').map(function(hex){ parseInt(hex, 16)});
  assert(decimals.length === 6, 'MAC addresses must be six bytes');

  return {
    link_type: 'LINKTYPE_ETHERNET',
    header: new Buffer([
      249, 133,  27,  86,  // Seconds
      137, 239,   1,   0,  // Microseconds
       42,   0,   0,   0,  // Captured length
       42,   0,   0,   0,  // Total length
    ]),
    buf: new Buffer([
      255, 255, 255, 255, 255, 255,  // Destination MAC address
      decimals[0],decimals[1],decimals[2],decimals[3],decimals[4], decimals[5],// Source MAC address
        8,   6,  // EtherType (0x0806 = ARP)
        0,   1,  // HTYPE
        8,   0,  // PTYPE
        6,       // HLEN
        4,       // PLEN
        0,   1,  // Operation
      decimals[0],decimals[1],decimals[2],decimals[3],decimals[4], decimals[5],// Source MAC address,                   // SHA
        0,   0,   0,   0,            // SPA
        0,   0,   0,   0,   0,   0,  // THA
       10,   0,  10,  20,            // TPA
    ]),
  };
}

startTests = function() {
    beforeEach(function(done) {
        done();
    });
    it('should correctly convert string hex to decimal array', function(done) {
        int_array = dash_button.hex_to_int_array(hex)
        done(); 
    });
    it('should correctly convert a decimal array to string hex', function(done) {
        dash_button.int_array_to_hex(int_array).should.equal(hex);
        done(); 
    });
    it('should recognize an arp request', function(done) {
        fake_session.emit('packet',packet1)
        dash_button.register(hex).on('detected', function(){
            done();
        });        
    });
    it('should not fire with more than 2 arp requests in 2 seconds', function(done) {
        dash_button.register(hex).on('detected', function(){
            done();
        });        
    });
    two_tester = dash_button.register([hex2,hex3]);
    
    it('should recognize first of two arp requests', function(done) {
        two_tester.on('detected', function(mac_address){
            if (mac_address === hex2) done();
        }); 
    });
    it('should recognize second of two arp requests', function(done) {
        two_tester.on('detected', function(mac_address){
            if (mac_address === hex3) done();
        }); 
    });
}




startTests();