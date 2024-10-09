const os = require('os');
const SI = require('systeminformation');
const { exec } = require('child_process');

class System {
  platform() {
    return os.platform();
  }
  networkInterfaces() {
    return os.networkInterfaces();
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