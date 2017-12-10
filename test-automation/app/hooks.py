import os
from contextlib import contextmanager

import logging
from aloe import around, world
from selenium.webdriver.remote.remote_connection import LOGGER
from selenium import webdriver

'''
this method sets a global variable of type WebDriver. This is the browser.
@around.all is a global hook. It will be ran once before all scenarios
After the last scenario is completed (pass or fail) the WebDriver will be closed
'''
@around.all
@contextmanager
def with_firefox():
    LOGGER.setLevel(logging.WARNING)
    driver_path = os.path.dirname(os.path.realpath(__file__)).replace("app", "conf\geckodriver.exe")
    world.browser = webdriver.Firefox(executable_path = driver_path)
    world.browser.maximize_window()
    yield
    world.browser.quit()
    delattr(world, 'browser')