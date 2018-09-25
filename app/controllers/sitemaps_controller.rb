class SitemapsController < ApplicationController
  layout :false
  before_action :init_sitemap

  def index
    @page_slugs = Page.all_slugs
    @sign_ids = [398]

    respond_to do |format|
      format.xml
    end
  end

  private

  def init_sitemap
    headers['Content-Type'] = 'application/xml'
  end

end