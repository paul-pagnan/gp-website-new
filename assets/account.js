  function initEventListeners() {
    // Show reset password form
    jQuery('#RecoverPassword').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });

    // Hide reset password form
    jQuery('#HideRecoverPasswordLink').on('click', function(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    });
  }

  /**
   *
   *  Show/Hide recover password form
   *
   */
  function toggleRecoverPasswordForm() {
    jQuery('#RecoverPasswordForm').toggleClass('hide');
    jQuery('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *
   *  Show reset password success message
   *
   */
  function resetPasswordSuccess() {
    var $formState = jQuery('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    jQuery('#ResetSuccess').removeClass('hide');
  }

  /**
   *
   *  Show/hide customer address forms
   *
   */
  function customerAddressForm() {
    var $newAddressForm = jQuery('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        'AddressCountryNew',
        'AddressProvinceNew',
        {
          hideElement: 'AddressProvinceContainerNew'
        }
      );
    }

    // Initialize each edit form's country/province selector
    jQuery('.address-country-option').each(function() {
      var formId = jQuery(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });

    // Toggle new/edit address forms
    jQuery('.address-new-toggle').on('click', function() {
      $newAddressForm.toggleClass('hide');
    });

    jQuery('.address-edit-toggle').on('click', function() {
      var formId = jQuery(this).data('form-id');
      jQuery('#EditAddress_' + formId).toggleClass('hide');
    });

    jQuery('.address-delete').on('click', function() {
      var $el = jQuery(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');

      // eslint-disable-next-line no-alert
      if (
        confirm(
          confirmMessage || 'Are you sure you wish to delete this address?'
        )
      ) {
        Shopify.postLink('/account/addresses/' + formId, {
          parameters: { _method: 'delete' }
        });
      }
    });
  }

  /**
   *
   *  Check URL for reset password hash
   *
   */
  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

jQuery(document).ready(function() {
  checkUrlHash();
  initEventListeners();
  resetPasswordSuccess();
  customerAddressForm();
});

