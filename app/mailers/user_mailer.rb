class UserMailer < ApplicationMailer
  def test_email
    @user = params[:user]
    mail(to: @user.email, subject: "Hello world")
  end
end
