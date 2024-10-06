# # import numpy as np
# # import ssl
# # import matplotlib.pyplot as plt
# # from astropy.coordinates import SkyCoord
# # import astropy.units as u
# # from astroquery.gaia import Gaia
# # import argparse

# # # Increase row limit to retrieve more stars
# # Gaia.ROW_LIMIT = 5000  # Adjust this to the maximum number of stars you'd like to retrieve

# # # Set up argument parsing
# # parser = argparse.ArgumentParser(description="Query stars around an exoplanet.")
# # parser.add_argument("ra_exo", type=float, help="Right Ascension of the exoplanet in degrees")
# # parser.add_argument("dec_exo", type=float, help="Declination of the exoplanet in degrees")
# # parser.add_argument("distance_exo", type=float, help="Distance to the exoplanet in parsecs")

# # args = parser.parse_args()

# # # Use the parsed arguments to set values
# # ra_exo = args.ra_exo  # Convert to radians
# # dec_exo = args.dec_exo  # Convert to radians

# # # Allow unverified SSL connections
# # ssl._create_default_https_context = ssl._create_unverified_context

# # # Query Gaia for stars around a given RA/DEC
# # coord = SkyCoord(ra_exo, dec_exo, unit=(u.degree, u.degree), frame='icrs')

# # # Increase the width and height of the search area
# # width = u.Quantity(5, u.deg)  # Increase search width
# # height = u.Quantity(5, u.deg)  # Increase search height

# # # Perform the query
# # r = Gaia.query_object_async(coordinate=coord, width=width, height=height)

# # # Extract RA, DEC, and parallax from the results
# # ra = np.array(r['ra'])  # in degrees
# # dec = np.array(r['dec'])  # in degrees
# # parallax = np.array(r['parallax'])  # in milliarcseconds (mas)

# # # Convert parallax to distance in parsecs (1 parsec = 1000 / parallax in mas)
# # distance = np.where(parallax > 0, 1000 / parallax, np.inf)  # distance in parsecs

# # # Brightness scaling: dim stars have larger distances, thus should be smaller on the plot
# # sizes = 1000 / distance  # Scale sizes for visibility

# # # Create the 2D scatter plot
# # plt.figure(figsize=(10, 10), facecolor='black')  # Black background for night sky
# # plt.scatter(ra, dec, s=sizes, c='white', alpha=0.5, edgecolor='none')  # Stars in white

# # # Add labels and title
# # plt.xlabel('Right Ascension [degrees]', color='white')
# # plt.ylabel('Declination [degrees]', color='white')
# # plt.title('Night Sky Representation of Stars Around Exoplanet', color='white')
# # plt.grid(False)  # Turn off grid
# # plt.gca().set_facecolor('black')  # Ensure the axes background is black

# # # Show the plot
# # plt.savefig('night_sky_stars_more.png', dpi=300, bbox_inches='tight')  # Save as PNG file with high resolution
# # plt.show()
# import numpy as np
# import ssl
# import matplotlib.pyplot as plt
# from astropy.coordinates import SkyCoord
# import astropy.units as u
# from astroquery.gaia import Gaia

# ssl._create_default_https_context = ssl._create_unverified_context

# # Query Gaia for stars around a given RA/DEC
# coord = SkyCoord(ra=185.1787793, dec=17.7932516, unit=(u.degree, u.degree), frame='icrs')
# width = u.Quantity(0.1, u.deg)
# height = u.Quantity(0.1, u.deg)
# r = Gaia.query_object_async(coordinate=coord, width=width, height=height)

# # Extract RA, DEC, and parallax from the results
# ra = np.array(r['ra'])  # in degrees
# dec = np.array(r['dec'])  # in degrees
# #ra = np.random.uniform(0, 360, len(dec))
# parallax = np.array(r['parallax'])  # in milliarcseconds (mas)

# # Convert parallax to distance in parsecs (1 parsec = 1000 / parallax in mas)
# distance = 1000 / parallax  # distance in parsecs
# print(parallax)
# # Convert RA and DEC from degrees to radians
# ra_rad = np.radians(ra)
# dec_rad = np.radians(dec)

# # Convert RA/DEC/Distance to Cartesian coordinates (x, y, z)
# x = distance * np.cos(dec_rad) * np.cos(ra_rad)
# y = distance * np.cos(dec_rad) * np.sin(ra_rad)
# z = distance * np.sin(dec_rad)

# # Plot the point cloud
# fig = plt.figure(figsize=(10, 10))
# ax = fig.add_subplot(111, projection='3d')
# ax.scatter(x, y, z, s=1)  # s=1 makes the points small

# ax.set_xlabel('X [parsecs]')
# ax.set_ylabel('Y [parsecs]')
# ax.set_zlabel('Z [parsecs]')
# plt.show()