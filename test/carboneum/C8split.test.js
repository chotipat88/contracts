import ether from '../helpers/ether';
import { increaseTimeTo, duration } from '../helpers/increaseTime';
import latestTime from '../helpers/latestTime';
import EVMRevert from '../helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CarboneumToken = artifacts.require('CarboneumToken');
const C8splitMany = artifacts.require('C8split_many');

contract('C8split_many', function ([_, admin, a, b, c, d]) {
  beforeEach(async function () {
    this.token = await CarboneumToken.new({ from: a });

    this.split = await C8splitMany.new(admin, this.token.address, { from: admin });
    await this.token.approve(this.split.address, ether(200000), { from: a });
    await this.token.approve(this.split.address, ether(200000), { from: admin });
  });

  describe('split', function () {
    it('should split.', async function () {
      await this.split.addNewUser(b, { from: admin });
      await this.split.addNewUser(c, { from: admin });
      await this.split.split(ether(10000), { from: a });
      let bBalance = await this.split.getBalance({ from: b });
      let cBalance = await this.split.getBalance({ from: c });

      let testBalanceB = await this.token.balanceOf(b);
      let adminBalance = await this.token.balanceOf(admin);
      adminBalance.should.be.bignumber.equal(ether(10000));
      cBalance.should.be.bignumber.equal(bBalance);
      cBalance.should.be.bignumber.equal(ether(5000));
      bBalance.should.be.bignumber.equal(ether(5000));

      testBalanceB.should.be.bignumber.equal(ether(0));
    });

    it('should split.', async function () {
      await this.split.addNewUser(b, { from: admin });
      await this.split.addNewUser(c, { from: admin });
      await this.split.split(ether(10000), { from: a });
      let bBalance = await this.split.getBalance({ from: b });
      let cBalance = await this.split.getBalance({ from: c });

      let testBalanceB = await this.token.balanceOf(b);
      let adminBalance = await this.token.balanceOf(admin);
      adminBalance.should.be.bignumber.equal(ether(10000));
      cBalance.should.be.bignumber.equal(bBalance);
      cBalance.should.be.bignumber.equal(ether(5000));
      bBalance.should.be.bignumber.equal(ether(5000));

      testBalanceB.should.be.bignumber.equal(ether(0));
    });

    it('should can withdraw.', async function () {
      await this.split.addNewUser(b, { from: admin });
      await this.split.addNewUser(c, { from: admin });
      await this.split.split(ether(10000), { from: a });
      await increaseTimeTo(latestTime() + duration.days(7) + duration.seconds(1));

      await this.split.withdraw({ from: b });
      await this.split.withdraw({ from: c });
      let bBalance = await this.token.balanceOf(b);
      let cBalance = await this.token.balanceOf(c);
      bBalance.should.be.bignumber.equal(ether(5000));
      cBalance.should.be.bignumber.equal(ether(5000));
    });

    it('B withdraw, C do not.', async function () {

      await this.split.addNewUser(b, { from: admin });
      await this.split.addNewUser(c, { from: admin });
      await this.split.split(ether(10000), { from: a });
      await increaseTimeTo(latestTime() + duration.days(7) + duration.seconds(1));

      await this.split.withdraw({ from: b });
      let bBalance = await this.token.balanceOf(b);
      let cBalance = await this.token.balanceOf(c);
      bBalance.should.be.bignumber.equal(ether(5000));
      cBalance.should.be.bignumber.equal(ether(0));
    });

    it('B withdraw, C do not. then A transfer more.', async function () {

      await this.split.addNewUser(b, { from: admin });
      await this.split.addNewUser(c, { from: admin });
      await this.split.split(ether(10000), { from: a });
      await increaseTimeTo(latestTime() + duration.days(7) + duration.seconds(1));

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

      let bBalance2 = await this.split.getBalance({ from: b });
      let cBalance2 = await this.split.getBalance({ from: c });
      bBalance2.should.be.bignumber.equal(ether(0));
      cBalance2.should.be.bignumber.equal(ether(10000));
    });

    it('3 address receiver', async function () {

      await this.split.addNewUser(b, { from: admin });
      await this.split.addNewUser(c, { from: admin });
      await this.split.addNewUser(d, { from: admin });
      await this.split.split(ether(30000), { from: a });
      await increaseTimeTo(latestTime() + duration.days(7) + duration.seconds(1));

      await this.split.withdraw({ from: b });
      await this.split.withdraw({ from: c });
      await this.split.withdraw({ from: d });
      let bBalance = await this.token.balanceOf(b);
      let cBalance = await this.token.balanceOf(c);
      let dBalance = await this.token.balanceOf(d);
      bBalance.should.be.bignumber.equal(ether(10000));
      cBalance.should.be.bignumber.equal(ether(10000));
      dBalance.should.be.bignumber.equal(ether(10000));
    });

    it('Can not be able to withdraw before added 7 days.', async function () {
      await this.split.addNewUser(b, { from: admin });
      await this.split.withdraw({ from: b }).should.be.rejectedWith(EVMRevert);
    });

    it('Must receivable after added 7 days.', async function () {
      await this.split.addNewUser(b, { from: admin });
      await this.split.split(ether(30000), { from: a });
      await increaseTimeTo(latestTime() + duration.days(7) + duration.seconds(1));
      await this.split.withdraw({ from: b });
      let bBalance = await this.token.balanceOf(b);
      let adminBalance = await this.token.balanceOf(admin);
      bBalance.should.be.bignumber.equal(ether(30000));
      adminBalance.should.be.bignumber.equal(ether(0));
    });

    it('should not split if do not have any receiver.', async function () {
      await this.split.split(ether(10000), { from: a }).should.be.rejectedWith(EVMRevert);
    });
  });
});
