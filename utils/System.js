const os = require('os');
const SI = require('systeminformation');
const { exec } = require('child_process');

class System {
  /** @param {'start'|'restart'|'stop'|'status'} action  */
  apache(action) {
    return new Promise((res, rej) => {
      let command;

      if (action == 'start')
        command = 'sudo service apache2 start | sudo /etc/init.d/apache2 start';
      else if (action == 'restart')
        command = 'sudo service apache2 restart | sudo /etc/init.d/apache2 restart';
      else if (action == 'stop')
        command = 'sudo service apache2 stop | sudo /etc/init.d/apache2 stop';
      else if (action == 'status')
        command = 'sudo service apache2 status | sudo /etc/init.d/apache2 status';
      else
        return rej('[Apache] orden incorrecta')

      if (command)
        exec(command, (error, stdout, stderr) => {
          if (error) {
            return rej(`Error: ${error.message}`);
          }
          if (stderr) {
            return rej(`Stderr: ${stderr}`);
          }
          res(`Stdout: ${stdout}`);
        });
    });
  }
  platform() {
    return os.platform();
  }
  networkInterfaces() {
    return os.networkInterfaces();
  }
  /**
   * @returns {{ ipv4: string, ipv6: string, internal: string }}
   */
  getIPAddress() {
    const nets = os.networkInterfaces();
    const result = {};

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal)
          result.ipv4 = net.address;
        else if (net.family === 'IPv4' && net.internal)
          result.internal = net.address;
        else if (net.family === 'IPv6' && !net.internal)
          result.ipv6 = net.address;

        if (result.ipv4 && result.ipv6 && result.internal) break;
      }

      if (result.ipv4 && result.ipv6 && result.internal) break;
    }

    return result;
  }
  async all() {
    let cpu = this.cpu();
    let mem = this.mem();
    let osInfo = this.osinfo();
    let currentLoad = this.currentLoad();
    let ethernet = this.ethernet();
    let wifi = this.wifi();

    return {
      cpu: await cpu,
      mem: await mem,
      osInfo: await osInfo,
      currentLoad: await currentLoad,
      ethernet: await ethernet,
      wifi: await wifi
    }
  }
  cpu() {
    return SI.cpu()
  }
  currentLoad() {
    return SI.currentLoad()
  }
  mem() {
    return SI.mem()
  }
  fsSize() {
    return SI.fsSize()
  }
  diskLayout() {
    return SI.diskLayout()
  }
  osinfo() {
    return SI.osInfo()
  }
  ethernet() {
    return SI.networkConnections()
  }
  wifi() {
    return SI.wifiConnections()
  }
  /** @param {string} cmdStr @returns {Promise<[string, ExecException, string]>} */
  cmd(cmdStr) {
    return new Promise((res, rej) => {
      try {
        exec(cmdStr, (error, stdout, stderr) => {
          res([stdout || null, error || null, stderr || null]);
        })
      } catch (e) {
        res([null, e]);
      }
    })
  }
  powerOff(force) {
    return this.cmd(force ? 'sudo shutdown -h now' : 'sudo poweroff');
  }
  reboot(force) {
    return this.cmd(force ? 'sudo shutdown -r now' : 'sudo reboot');
  }
}

module.exports = System;