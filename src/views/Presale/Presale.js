import "./Presale.css";
import React from "react";
import { useLocalStorage } from "react-use";
import { useWeb3React } from "@web3-react/core";
import { useParams } from "react-router-dom";
import SEO from "../../components/Common/SEO";
import Tab from "../../components/Tab/Tab";
import Loader from "../../components/Common/Loader";
import Footer from "../../Footer";
import {
  useChainId,
  getPageTitle,
  REFERRALS_SELECTED_TAB_KEY,
  useLocalStorageSerializeKey,
  isHashZero,
} from "../../Helpers";
import {
  useReferralsData,
  registerReferralCode,
  useCodeOwner,
  useReferrerTier,
  useUserReferralCode,
} from "../../Api/referrals";
import JoinReferralCode from "../../components/Referrals/JoinReferralCode";
import AffiliatesStats from "../../components/Referrals/AffiliatesStats";
import TradersStats from "../../components/Referrals/TradersStats";
import AddAffiliateCode from "../../components/Referrals/AddAffiliateCode";
import { deserializeSampleStats, isRecentReferralCodeNotExpired } from "../../components/Referrals/referralsHelper";
import { ethers } from "ethers";

const TRADERS = "Traders";
const AFFILIATES = "Affiliates";
const TAB_OPTIONS = [TRADERS, AFFILIATES];

function Presale({ connectWallet, setPendingTxns, pendingTxns }) {
  const { active, account: walletAccount, library } = useWeb3React();
  const { account: queryAccount } = useParams();
  let account;
  if (queryAccount && ethers.utils.isAddress(queryAccount)) {
    account = ethers.utils.getAddress(queryAccount);
  } else {
    account = walletAccount;
  }
  const { chainId } = useChainId();
  const [activeTab, setActiveTab] = useLocalStorage(REFERRALS_SELECTED_TAB_KEY, TRADERS);
  const { data: referralsData, loading } = useReferralsData(chainId, account);
  const [recentlyAddedCodes, setRecentlyAddedCodes] = useLocalStorageSerializeKey([chainId, "REFERRAL", account], [], {
    deserializer: deserializeSampleStats,
  });
  const { userReferralCode, userReferralCodeString } = useUserReferralCode(library, chainId, account);
  const { codeOwner } = useCodeOwner(library, chainId, account, userReferralCode);
  const { referrerTier: traderTier } = useReferrerTier(library, chainId, codeOwner);

  function handleCreateReferralCode(referralCode) {
    return registerReferralCode(chainId, referralCode, library, {
      sentMsg: "Referral code submitted!",
      failMsg: "Referral code creation failed.",
      pendingTxns,
    });
  }

  function renderAffiliatesTab() {
    const isReferralCodeAvailable =
      referralsData?.codes?.length > 0 || recentlyAddedCodes?.filter(isRecentReferralCodeNotExpired).length > 0;
    if (loading) return <Loader />;
    if (isReferralCodeAvailable) {
      return (
        <AffiliatesStats
          referralsData={referralsData}
          handleCreateReferralCode={handleCreateReferralCode}
          setRecentlyAddedCodes={setRecentlyAddedCodes}
          recentlyAddedCodes={recentlyAddedCodes}
          chainId={chainId}
        />
      );
    } else {
      return (
        <AddAffiliateCode
          handleCreateReferralCode={handleCreateReferralCode}
          active={active}
          connectWallet={connectWallet}
          recentlyAddedCodes={recentlyAddedCodes}
          setRecentlyAddedCodes={setRecentlyAddedCodes}
        />
      );
    }
  }

  function renderTradersTab() {
    if (loading) return <Loader />;
    if (isHashZero(userReferralCode) || !account || !userReferralCode) {
      return (
        <JoinReferralCode
          connectWallet={connectWallet}
          active={active}
          setPendingTxns={setPendingTxns}
          pendingTxns={pendingTxns}
        />
      );
    }
    return (
      <TradersStats
        userReferralCodeString={userReferralCodeString}
        chainId={chainId}
        referralsData={referralsData}
        setPendingTxns={setPendingTxns}
        pendingTxns={pendingTxns}
        traderTier={traderTier}
      />
    );
  }

  return (
    <div className="Exchange page-layout">
      <div className="Page-title">Presale</div>
      <br></br>
      <br></br>
      <div class="Exchange-content">
        <div class="Home-token-card-option">
          <div>
            <div class="Home-token-card-option-title">Swap pDIV -&gt; DIV</div>
            <div class="Tab inline Exchange-swap-order-type-tabs">
              DIV is the utility and governance token. Accrues 30% of the platform's generated fees
            </div>
          </div>
          <div class="Exchange-swap-section">
            <div class="Exchange-swap-section-top">
              <div class="muted">From</div>
            </div>
            <div class="Exchange-swap-section-bottom">
              <div class="Exchange-swap-input-container"></div>
              <div>
                <div class="TokenSelector">
                  <div class="TokenSelector-box">pDIV</div>
                </div>
              </div>
            </div>
          </div>
          <div class="Exchange-swap-ball-container">
            <div class="Exchange-swap-ball">
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="0"
                viewBox="0 0 512 512"
                class="Exchange-swap-ball-icon"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M131.3 231.1L32 330.6l99.3 99.4v-74.6h174.5v-49.7H131.3v-74.6zM480 181.4L380.7 82v74.6H206.2v49.7h174.5v74.6l99.3-99.5z"></path>
              </svg>
            </div>
          </div>
          <div class="Exchange-swap-section">
            <div class="Exchange-swap-section-top">
              <div class="muted">To</div>
            </div>
            <div class="Exchange-swap-section-bottom">
              <div></div>
              <div>
                <div class="TokenSelector">
                  <div class="TokenSelector-box">DIV</div>
                </div>
              </div>
            </div>
          </div>
          <div class="Exchange-swap-button-container">
            <button class="App-cta Exchange-swap-button">Swap</button>
          </div>
        </div>
        <div class="Exchange-right">
          <div class="Home-token-card-option">
            <div class="Home-token-card-option-icon">Vesting</div>
            <div class="Home-token-card-option-info">
              <div class="Home-token-card-option-title">
                DIV is the utility and governance token. Accrues 30% of the platform's generated fees.
              </div>
              <div class="Home-token-card-option-apr">Arbitrum APR: 15.33%, Avalanche APR: 15.22%</div>
              <div class="Home-token-card-option-apr">Arbitrum APR: 15.33%, Avalanche APR: 15.22%</div>
              <div class="Home-token-card-option-apr">Arbitrum APR: 15.33%, Avalanche APR: 15.22%</div>
              <div class="Home-token-card-option-action"></div>
            </div>
          </div>
          <div class="Exchange-wallet-tokens">
            <div class="Exchange-wallet-tokens-content">
              <div class="ExchangeWalletTokens App-box">
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>ETH</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Ethereum</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>WETH</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Wrapped Ethereum</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>BTC</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Bitcoin (WBTC)</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>LINK</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Chainlink</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>UNI</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Uniswap</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>USDC</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">USD Coin</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>USDT</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Tether</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>DAI</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Dai</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>FRAX</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Frax</div>
                  </div>
                </div>
                <div class="ExchangeWalletTokens-token-row">
                  <div class="ExchangeWalletTokens-top-row">
                    <div>MIM</div>
                  </div>
                  <div class="ExchangeWalletTokens-content-row">
                    <div class="ExchangeWalletTokens-token-name">Magic Internet Money</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Presale;
