const ethers = require('ethers');

const getContract = (address,abi,provider) =>{
    if(!address){
        throw new Error('Provide contract address')
        return
    }
    if(!abi){
        throw new Error('Provide contract abi')
        return
    }
    if(!provider){
        throw new Error('Provide contract provider')
        return
    }
    return new ethers.Contract(
        address,
        abi,
        provider
    );
}

module.exports = { getContract }