/* global process */
import React, {useEffect, useState} from 'react';
import '../style/scss/style.scss';
import { useStore } from '../store';
import { Provider  } from 'react-redux';
import commerce from '../lib/commerce';
import { loadStripe } from '@stripe/stripe-js';
import { setCustomer } from '../store/actions/authenticateActions';
import 'swiper/components/effect-fade/effect-fade.scss';
import categorySlug, {whitelistDomains, whitelistBrands} from '../utils/categorySlug';

const MyApp = ({Component, pageProps}) => {

  const store = useStore(pageProps.initialState);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) { // has API key
      setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY));
    }

    store.dispatch(setCustomer());
    //let subdomain;
    let domain;
    let brand;
    if (typeof window !== 'undefined') {
      
      if(window.location.hostname){
        domain = window.location.hostname;
        //subdomain = window.location.hostname.split('.').slice(0, -2).join('.');
      }
      if(window.location.search){
        const searchParams = new URLSearchParams(window.location.search);
        brand = searchParams.get('brand');
      }
    }
    const slug = whitelistDomains.includes(domain)
      ? categorySlug(domain)
      : whitelistBrands.includes(brand)
      ? categorySlug(brand)
      : null;

    if (slug) {
      commerce.categories.retrieve(slug, { type: 'slug' }).then((category) => {
        console.log(category)
        if(category.children.length > 0) {
          const promises = [];
          category.children.map((cat) => {
            if (!cat.assets) {
              //call commerce
              promises.push(commerce.categories.retrieve(cat.slug, { type: 'slug' }));
            }
          });
          Promise.all(promises).then((results) => {
            store.dispatch({
              type: 'STORE_CATEGORIES',
              payload: results,
            });
          });
        } else {
          store.dispatch({
            type: 'STORE_CATEGORIES',
            payload: [category],
          });
        }
      });

      commerce.products
        .list({
          category_slug: [slug],
        })
          .then((res) => {
            const products = res.data.filter(({ active }) => active);
            store.dispatch({
              type: 'STORE_PRODUCTS',
              payload: products,
            });
          });
    } else {
        commerce.categories.list().then((res) => {
          store.dispatch({
            type: 'STORE_CATEGORIES',
            payload: res.data,
          });
        });
        commerce.products.list().then((res) => {
          const products = res.data.filter(({ active }) => active);
          store.dispatch({
            type: 'STORE_PRODUCTS',
            payload: products,
          });
        });
    }  

  }, [store])

  return (
    <Provider store={store}>
      <Component
        {...pageProps}
        stripe={stripePromise}
      />
    </Provider>
  );

}

export default MyApp;
