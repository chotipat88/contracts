import ether from '../helpers/ether';
import { duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CarboneumToken = artifacts.require('CarboneumToken');
const C8split = artifacts.require('C8split');

contract('C8split', function ([_, admin, a, b, c]) {
  beforeEach(async function () {
    const unlockDate = latestTime() + duration.seconds(100);

    this.token = await CarboneumToken.new({ from: a });

    this.split = await C8split.new(b, c, admin, this.token.address, unlockDate, { from: admin });
    await this.token.approve(this.split.address, ether(20000), { from: a });
    await this.token.approve(this.split.address, ether(20000), { from: admin });
  });

  describe('split', function () {
    it('should split.', async function () {
      await this.split.split(ether(10000), { from: a });
      let bBalance = await this.split.getBalance1();
      let cBalance = await this.split.getBalance2();

      let testBalanceB = await this.token.balanceOf(b);

      let adminBalance = await this.token.balanceOf(admin);
      adminBalance.should.be.bignumber.equal(ether(10000));
      cBalance.should.be.bignumber.equal(bBalance);
      cBalance.should.be.bignumber.equal(ether(5000));
      bBalance.should.be.bignumber.equal(ether(5000));

      testBalanceB.should.be.bignumber.equal(ether(0));
    });

    it('should can withdraw.', async function () {
      await this.split.split(ether(10000), { from: a });
      await this.split.withdraw({ from: b });
      await this.split.withdraw({ from: c });
      let bBalance = await this.token.balanceOf(b);
      let cBalance = await this.token.balanceOf(c);
      bBalance.should.be.bignumber.equal(ether(5000));
      cBalance.should.be.bignumber.equal(ether(5000));
    });

    it('B withdraw, C do not.', async function () {
      await this.split.split(ether(10000), { from: a });
      await this.split.withdraw({ from: b });
      let bBalance = await this.token.balanceOf(b);
      let cBalance = await this.token.balanceOf(c);
      bBalance.should.be.bignumber.equal(ether(5000));
      cBalance.should.be.bignumber.equal(ether(0));
    });

    it('B withdraw, C do not. then A transfer more.', async function () {
      await this.split.split(ether(10000), { from: a });
      await this.split.withdraw({ from: b });
      let bBalance = await this.token.balanceOf(b);
      let cBalance = await this.token.balanceOf(c);
      bBalance.should.be.bignumber.equal(ether(5000));
      cBalance.should.be.bignumber.equal(ether(0));

      await this.split.split(ether(10000), { from: a });
      await this.split.withdraw({ from: b });
      let testBalanceB = await this.token.balanceOf(b);
      let testBalanceC = await this.token.balanceOf(c);
      testBalanceB.should.be.bignumber.equal(ether(10000));
      testBalanceC.should.be.bignumber.equal(ether(0));

      let bBalance2 = await this.split.getBalance1();
      let cBalance2 = await this.split.getBalance2();
      bBalance2.should.be.bignumber.equal(ether(0));
      cBalance2.should.be.bignumber.equal(ether(10000));
    });
  });
});
