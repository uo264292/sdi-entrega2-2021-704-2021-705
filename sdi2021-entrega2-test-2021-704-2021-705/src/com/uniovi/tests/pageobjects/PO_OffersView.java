package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;



public class PO_OffersView extends PO_NavView{

	public static void addOffer(WebDriver driver, String titulop, String detallesp, double preciop, boolean destacadap) {
		clickOptionId(driver, "mOfertasAgregar", "id");
		
		WebElement titulo = driver.findElement(By.name("titulo"));
		titulo.click();
		titulo.clear();
		titulo.sendKeys(titulop);
		WebElement detalles = driver.findElement(By.name("detalles"));
		detalles.click();
		detalles.clear();
		detalles.sendKeys(detallesp);
		WebElement precio = driver.findElement(By.name("precio"));
		precio.click();
		precio.clear();
		precio.sendKeys(String.valueOf(preciop));
		if(destacadap) {
			WebElement destacada = driver.findElement(By.name("destacada"));
			destacada.click();
		}
			
		By boton = By.className("btn");
		driver.findElement(boton).click();	
		
	}
	static public void deleteLastOffer(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/ofertas/propias");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr"));
		int n = elementos.size();
		String s = "/html/body/div/div/table/tbody[1]/tr[" + (n) + "]/td[4]/a[2]";
		List<WebElement> elementos2 = driver.findElements(By.xpath(s));
		elementos2.get(0).click();
	}
	
	static public void deleteOffer1(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/ofertas/propias");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr/td[4]/a[2]"));
		elementos.get(0).click();
	}
	
	static public String getOffer1(WebDriver driver) {		
		clickOptionId(driver, "mOfertas", "id");
		
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/form/table/tbody[1]/tr/th[1]"));
		return elementos.get(0).getText();
	}
	
	static public void buyOfferByName(WebDriver driver, String offer) {		
		searchOfferByName(driver,offer);
		
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div[3]/table/tbody/tr/td[4]/a[1]"));
		elementos.get(0).click();
	
		
	}
	
	static public void searchOfferByName(WebDriver driver, String offer) {		
		driver.navigate().to("https://localhost:8081/ofertas");		
		WebElement barraBusqueda = driver.findElement(By.id("busqueda"));
		barraBusqueda.click();
		barraBusqueda.clear();
		barraBusqueda.sendKeys(offer);
		WebElement botonBusqueda = driver.findElement(By.id("botonBusqueda"));
		botonBusqueda.click();
	}
	

}
