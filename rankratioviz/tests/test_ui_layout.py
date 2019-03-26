import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
import time
import threading
# from selenium import webdriver
# TODO for checking interactions (via clicking on the rank plot) you can
# use webdriver.ActionChains: see https://stackoverflow.com/a/14887320


def start_rrv_server(rrv_dir, port_num):
    """Starts a server using a given port from a specified directory."""
    # Derived from top example in
    # https://docs.python.org/3/library/http.server.html
    server_address = ('', port_num)
    # We change to this directory since SimpleHTTPRequestHandler, by default,
    # serves from the current working directory
    # (https://stackoverflow.com/a/39801780)
    os.chdir(rrv_dir)
    http_daemon = HTTPServer(server_address, SimpleHTTPRequestHandler)
    http_daemon.serve_forever()


def test_ui_layout():
    """Tests that the basic layout of the UI looks kosher.

       This is the first test I've written with Selenium, so this is mostly
       a proof of concept that Selenium is set up properly.
    """
    return
    byrd_dir = os.path.join("rankratioviz", "tests", "output", "byrd")
    port_num = 8000
    # We encase the args in a tuple because args is expected to be an iterable
    # See https://stackoverflow.com/a/37116824
    # Also, serve_forever() runs until stopped, which is why we enclose it in a
    # Thread (as discussed in https://stackoverflow.com/a/33028888)
    server_thread = threading.Thread(target=start_rrv_server,
                                     args=(byrd_dir, port_num), daemon=True)
    server_thread.start()
    # opts = webdriver.ChromeOptions()
    # opts.add_argument("headless")
    # wd = webdriver.Chrome(options=opts)
    wd = webdriver.Chrome()
    # This isn't really elegant (ideally we'd use an Event or something to wait
    # until serve_forever() has started) but this should work for time being
    time.sleep(0.5)
    # Navigate to the server where rrv is being hosted
    wd.get("localhost:{}".format(port_num))
    # Now we can finally start testing things!
    # Check the page title
    assert wd.title == "rankratioviz"
    # Trivially, check that the sample plot is to the right of the rank plot
    rankplot = wd.find_element_by_id("rankPlot")
    sampleplot = wd.find_element_by_id("samplePlot")
    rankplot_right_edge_x = rankplot.location['x'] + rankplot.size['width']
    assert rankplot_right_edge_x < sampleplot.location['x']

    # At this point, we're done with testing. Close down the environment.
    wd.close()
