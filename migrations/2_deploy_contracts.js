const CarboneumToken = artifacts.require('CarboneumToken');
const C8splitMany = artifacts.require('C8split_many');

function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = function (deployer, network, accounts) {
  let crowdsale;
  if (network === 'rinkeby') {
    return deployer.then(function () {
      return C8splitMany.new('0xa250a55a282aF49809B7BE653631f12603c3797B',
        '0xd36255cee98d10068d0bc1a394480bf09b3db4d7', 7 * 24 * 60 * 60);
    }).then(function (instance) {
      let token = CarboneumToken.at('0xd36255cee98d10068d0bc1a394480bf09b3db4d7');
      token.approve(instance.address, ether(20000000000));
      crowdsale = instance;
      console.log('Contract Address: ', crowdsale.address);
    });
  }
};
