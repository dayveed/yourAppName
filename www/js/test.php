/* Customize Emails */
add_filter('wp_new_user_notification_email', 'rego_welcome_email', 10, 3);

function rego_welcome_email($wp_new_user_notification_email, $user, $blogname)
{
  if (get_user_meta($user->ID, 'membership_user_role', true) == 'job_seeker')
  {
    # change the default email
    $wp_new_user_notification_email['message'] .= sprintf("\r\nWhile you're there,
      please complete your profile, so that potential hirers can find you and
      contact you.\r\n\r\nSee you there,\r\nWebsite Owner");
  }
  return $wp_new_user_notification_email;
}