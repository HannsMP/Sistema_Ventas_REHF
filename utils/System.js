const SI = require('systeminformation');
const { exec } = require('child_process');

class System {
  all() {
    return {
      cpu: this.cpu(),
      mem: this.mem(),
      osInfo: this.osinfo(),
      currentLoad: this.currentLoad(),
      ethernet: this.ethernet(),
      wifi: this.wifi()
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