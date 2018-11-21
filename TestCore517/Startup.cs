using System;
using System.Linq;
using Atalasoft.Imaging.WebControls;
using Atalasoft.Imaging.WebControls.Core;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.DependencyInjection;


namespace TestCore517
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
       
            services.AddResponseCaching();

            services.AddResponseCompression( options =>
            {
                options.Providers.Add<GzipCompressionProvider>();
                options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] {"image/png"});
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseResponseCaching();

            app.Map( "/wdv", wdvApp => {

                wdvApp.Use(async (context, next) =>
                {
                    context.Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromSeconds(10)
                    };

                    await next();
                });

                wdvApp.RunWebDocumentViewerMiddleware(new WebDocumentViewerOptions(){ReplaceFileExtensionOnSave = ReplaceFileExtension.AllFiles},new AbWdvCallbacks());
            });
        }
    }
}
